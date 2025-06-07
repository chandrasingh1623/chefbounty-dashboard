import { users, events, bids, messages, type User, type InsertUser, type Event, type InsertEvent, type Bid, type InsertBid, type Message, type InsertMessage } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  getEventsByHostId(hostId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined>;

  // Bid operations
  getBidsByEventId(eventId: number): Promise<Bid[]>;
  getBidsByChefId(chefId: number): Promise<Bid[]>;
  getBidById(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBidStatus(id: number, status: string): Promise<Bid | undefined>;

  // Message operations
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getEventsByHostId(hostId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.hostId, hostId)).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
  }

  async getBidsByEventId(eventId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.eventId, eventId)).orderBy(desc(bids.createdAt));
  }

  async getBidsByChefId(chefId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.chefId, chefId)).orderBy(desc(bids.createdAt));
  }

  async getBidById(id: number): Promise<Bid | undefined> {
    const result = await db.select().from(bids).where(eq(bids.id, id)).limit(1);
    return result[0];
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const result = await db.insert(bids).values(bid).returning();
    return result[0];
  }

  async updateBidStatus(id: number, status: string): Promise<Bid | undefined> {
    const result = await db.update(bids).set({ status }).where(eq(bids.id, id)).returning();
    return result[0];
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        and(
          eq(messages.senderId, userId1),
          eq(messages.receiverId, userId2)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const result = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
