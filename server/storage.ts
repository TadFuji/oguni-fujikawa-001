import { conversations, type Conversation, type InsertConversation } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  getConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationStats(): Promise<{
    totalConversations: number;
    todayConversations: number;
    averageMessageLength: number;
    totalDuration: number;
    popularTopics: string[];
  }>;
  getConversationsByDateRange(startDate: Date, endDate: Date): Promise<Conversation[]>;
}

export class DatabaseStorage implements IStorage {
  async getConversations(): Promise<Conversation[]> {
    const result = await db.select().from(conversations).orderBy(desc(conversations.createdAt));
    return result;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalResult] = await db.select({ count: count() }).from(conversations);
    
    const [todayResult] = await db
      .select({ count: count() })
      .from(conversations)
      .where(sql`${conversations.createdAt} >= ${today}`);
    
    const [avgResult] = await db
      .select({ 
        avgLength: sql<number>`COALESCE(AVG(${conversations.messageLength}), 0)`,
        totalDuration: sql<number>`COALESCE(SUM(${conversations.duration}), 0)`
      })
      .from(conversations);

    return {
      totalConversations: totalResult.count,
      todayConversations: todayResult.count,
      averageMessageLength: Math.round(avgResult.avgLength || 0),
      totalDuration: avgResult.totalDuration || 0,
      popularTopics: [] // TODO: 実装予定
    };
  }

  async getConversationsByDateRange(startDate: Date, endDate: Date): Promise<Conversation[]> {
    const result = await db
      .select()
      .from(conversations)
      .where(sql`${conversations.createdAt} >= ${startDate} AND ${conversations.createdAt} <= ${endDate}`)
      .orderBy(desc(conversations.createdAt));
    return result;
  }
}

export const storage = new DatabaseStorage();
