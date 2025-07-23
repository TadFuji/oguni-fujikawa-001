import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConversationSchema, difyRequestSchema, difyResponseSchema } from "@shared/schema";
import { z } from "zod";

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

  // Google Cloud Text-to-Speech API endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "テキストが必要です" });
      }

      // Processing TTS request

      const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
      if (!googleApiKey) {
        console.log('🔊 Google Cloud API Key未設定、Web Speech APIにフォールバック');
        return res.status(404).json({ message: "Google Cloud TTS利用不可、Web Speech APIを使用" });
      }

      // Google Cloud TTS API call
      const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { 
            ssml: `<speak>
              <prosody rate="1.3" pitch="-2.5st" volume="+3dB">
                <emphasis level="strong">
                  <break time="0.2s"/>
                  ${text.replace(/\n/g, '<break time="0.3s"/>').replace(/[<>&"']/g, '').replace(/！/g, '！<break time="0.2s"/>').replace(/？/g, '？<break time="0.3s"/>')}
                  <break time="0.1s"/>
                </emphasis>
              </prosody>
            </speak>`
          },
          voice: {
            languageCode: 'ja-JP',
            name: 'ja-JP-Neural2-C', // High-quality Japanese male voice
            ssmlGender: 'MALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.25, // Faster speaking rate for quicker delivery
            pitch: -2.5, // Slightly higher pitch for brightness while keeping masculine tone
            volumeGainDb: 4.0, // Louder and more energetic
            effectsProfileId: ['small-bluetooth-speaker-class-device'] // Optimize for mobile speakers
          }
        })
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('🔊 Google Cloud TTS API エラー:', ttsResponse.status, errorText);
        throw new Error(`Google Cloud TTS API error: ${ttsResponse.status}`);
      }

      const ttsData = await ttsResponse.json();
      
      if (!ttsData.audioContent) {
        throw new Error('No audio content received from Google Cloud TTS');
      }

      // TTS generated successfully

      // Convert base64 audio to binary and send as MP3
      const audioBuffer = Buffer.from(ttsData.audioContent, 'base64');
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      });
      
      res.send(audioBuffer);

    } catch (error) {
      console.error('🔊 Google Cloud TTS エラー:', error);
      // Return 404 to trigger fallback to Web Speech API
      res.status(404).json({ message: "Google Cloud TTS利用不可、Web Speech APIを使用" });
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
