import { conversations, type Conversation, type InsertConversation } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  getConversations(): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
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

}

export const storage = new DatabaseStorage();
