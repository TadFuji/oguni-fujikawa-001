import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, difyRequestSchema, difyResponseSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client globally for reuse and better performance
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000 // 10 second timeout for faster failure detection
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get conversation history
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "会話履歴の取得に失敗しました" });
    }
  });

  // OpenAI Text-to-Speech API endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "テキストが必要です" });
      }

      // Processing TTS request with OpenAI - optimized for speed

      if (!process.env.OPENAI_API_KEY) {
        console.log('🔊 OpenAI API Key未設定、Web Speech APIにフォールバック');
        return res.status(404).json({ message: "OpenAI TTS利用不可、Web Speech APIを使用" });
      }

      // Optimize text for faster TTS processing
      const optimizedText = text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, 4000); // Limit text length for faster processing

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      // Generate speech using OpenAI TTS - optimized for speed
      const mp3 = await openai.audio.speech.create({
        model: "tts-1", // Standard model for faster generation (vs tts-1-hd)
        voice: "onyx", // Deep, calm male voice with lower pitch
        input: optimizedText,
        speed: 0.9, // Slightly slower for lower perceived pitch
        response_format: "mp3"
      });

      // Stream response directly for faster delivery
      const audioBuffer = Buffer.from(await mp3.arrayBuffer());
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Cache-Control': 'public, max-age=300', // Shorter cache for faster updates
        'Accept-Ranges': 'bytes', // Enable range requests for better streaming
      });
      
      res.send(audioBuffer);

    } catch (error) {
      console.error('🔊 OpenAI TTS エラー:', error);
      // Return 404 to trigger fallback to Web Speech API
      res.status(404).json({ message: "OpenAI TTS利用不可、Web Speech APIを使用" });
    }
  });

  // Send message to Dify and get response
  app.post("/api/chat", async (req, res) => {
    try {
      const { userMessage } = req.body;
      
      if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ message: "メッセージが必要です" });
      }

      // Get Dify API credentials from environment
      const difyApiKey = process.env.DIFY_API_KEY || process.env.VITE_DIFY_API_KEY;
      
      if (!difyApiKey) {
        return res.status(500).json({ 
          message: "Dify APIキーが設定されていません。" 
        });
      }

      // Use fixed Dify API endpoint
      const difyApiUrl = "https://api.dify.ai/v1/chat-messages";

      // Prepare Dify API request with consistent user ID
      const difyRequest = {
        inputs: {},
        query: userMessage,
        response_mode: "blocking" as const,
        user: "kid-user-consistent", // Use consistent user ID for better context
      };



      // Use correct API key for Dify
      const correctApiKey = "app-oHgFPuW6h2qOSx49HPjEfbMS";

      // Call Dify API with correct API key
      const difyResponse = await fetch(difyApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${correctApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(difyRequest),
      });

      if (!difyResponse.ok) {
        throw new Error(`Dify API error: ${difyResponse.status} ${difyResponse.statusText}`);
      }

      const difyData = await difyResponse.json();
      
      let robotResponse = difyData.answer || "【重要】Difyから返答がありませんでした。設定を確認してください。";
      
      // Clean up the response by removing unwanted prefixes
      robotResponse = robotResponse
        .replace(/^Dify からの解答です\n=========\n/, '')
        .replace(/^Dify からの解答です\n/, '')
        .replace(/^=========\n/, '')
        .trim();

      // Calculate metrics for parent dashboard
      const messageLength = userMessage.length;
      const responseLength = robotResponse.length;
      const sessionId = (req as any).sessionID || 'anonymous';
      const duration = Math.max(2, Math.ceil(robotResponse.length / 10)); // Estimate based on response length

      // Save conversation to storage with metrics and raw Dify response
      const conversation = await storage.createConversation({
        userMessage,
        robotResponse,
        rawDifyResponse: difyData.answer, // Store the raw Dify response
        duration,
        messageLength,
        responseLength,
        sessionId,
      });

      res.json({
        conversation,
        robotResponse,
      });

    } catch (error) {
      console.error('🚨 Chat API error:', error);
      if (error instanceof Error) {
        console.error('🚨 Error stack:', error.stack);
      }
      const difyApiKey = process.env.DIFY_API_KEY || process.env.VITE_DIFY_API_KEY;
      const difyApiUrl = "https://api.dify.ai/v1/chat-messages";
      console.error('🚨 Dify API Key exists:', !!difyApiKey);
      console.error('🚨 Dify App URL:', difyApiUrl);
      
      // Return a fallback response that would be obvious if it appears
      res.status(500).json({ 
        message: "申し訳ありません。何か問題が発生しました。もう一度試してみてください。",
        robotResponse: "【エラー】Dify接続に問題が発生しました。"
      });
    }
  });

  // Parent dashboard API routes
  app.get("/api/parent/stats", async (req, res) => {
    try {
      const stats = await storage.getConversationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "統計データの取得に失敗しました" });
    }
  });

  app.get("/api/parent/conversations", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let conversations;
      
      if (startDate && endDate) {
        conversations = await storage.getConversationsByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        conversations = await storage.getConversations();
      }
      
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "会話履歴の取得に失敗しました" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
