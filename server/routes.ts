import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema } from "@shared/schema";

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
        return res.status(404).json({ message: "OpenAI TTS利用不可、Web Speech APIを使用" });
      }

      // Simple text processing for speed
      const optimizedText = text.trim();

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      // Generate speech using OpenAI TTS - optimized for speed
      const mp3 = await openai.audio.speech.create({
        model: "tts-1", // Standard model for faster generation (vs tts-1-hd)
        voice: "alloy", // Balanced, neutral voice suitable for children
        input: optimizedText,
        speed: 1.0, // Normal speaking rate for clearer delivery
        response_format: "mp3"
      });

      // Direct response for maximum speed
      const audioBuffer = Buffer.from(await mp3.arrayBuffer());
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
      });
      
      res.send(audioBuffer);

    } catch (error) {
      console.error('OpenAI TTS error:', error);
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

      // Call Dify API with simpler, faster configuration
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
      
      // Simple text cleanup for faster processing
      robotResponse = robotResponse
        .replace(/^Dify からの解答です\n=========\n/, '')
        .replace(/^Dify からの解答です\n/, '')
        .replace(/^=========\n/, '')
        .trim();



      // Save conversation to storage
      const conversation = await storage.createConversation({
        userMessage,
        robotResponse,
      });

      res.json({
        conversation,
        robotResponse,
      });

    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        message: "申し訳ありません。何か問題が発生しました。もう一度試してみてください。",
        robotResponse: "【エラー】Dify接続に問題が発生しました。"
      });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
