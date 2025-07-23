import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userMessage: text("user_message").notNull(),
  robotResponse: text("robot_response").notNull(),
  rawDifyResponse: text("raw_dify_response"), // Difyからの生の返答（デバッグ用）
  duration: integer("duration"), // 会話の長さ（秒）
  messageLength: integer("message_length"), // ユーザーメッセージの文字数
  responseLength: integer("response_length"), // ロボット応答の文字数
  sessionId: varchar("session_id", { length: 50 }), // セッション識別子
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userMessage: true,
  robotResponse: true,
  rawDifyResponse: true,
  duration: true,
  messageLength: true,
  responseLength: true,
  sessionId: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Dify API request/response schemas
export const difyRequestSchema = z.object({
  inputs: z.record(z.string()),
  query: z.string(),
  response_mode: z.literal("blocking"),
  conversation_id: z.string().optional(),
  user: z.string(),
  files: z.array(z.any()).optional(),
});

export const difyResponseSchema = z.object({
  answer: z.string(),
  conversation_id: z.string(),
  created_at: z.number(),
  id: z.string(),
});

export type DifyRequest = z.infer<typeof difyRequestSchema>;
export type DifyResponse = z.infer<typeof difyResponseSchema>;
