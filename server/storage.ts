import { 
  users, 
  events, 
  bids, 
  messages, 
  chefAvailability,
  payments,
  paymentMethods,
  type User, 
  type InsertUser, 
  type Event, 
  type InsertEvent, 
  type Bid, 
  type InsertBid, 
  type Message, 
  type InsertMessage,
  type ChefAvailability,
  type InsertChefAvailability,
  type Payment,
  type InsertPayment,
  type PaymentMethod,
  type InsertPaymentMethod
} from "@shared/schema";
import { eq, desc, and, between, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
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
  getConversationsForUser(userId: number): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  markConversationAsRead(userId: number, otherUserId: number): Promise<void>;
  toggleMessageStar(id: number): Promise<Message | undefined>;

  // Chef Availability operations
  getChefAvailability(chefId: number, startDate: string, endDate: string): Promise<ChefAvailability[]>;
  createOrUpdateAvailability(availability: InsertChefAvailability): Promise<ChefAvailability>;

  // Payment operations
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Payment Method operations
  getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  removePaymentMethod(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
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
    // Sanitize the updates object to handle any problematic fields
    const sanitizedUpdates = { ...updates };
    
    // Remove any undefined fields that could cause issues
    Object.keys(sanitizedUpdates).forEach(key => {
      const value = sanitizedUpdates[key];
      if (value === undefined || value === null) {
        delete sanitizedUpdates[key];
      }
    });
    
    console.log("Storage updateUser - sanitized updates:", JSON.stringify(sanitizedUpdates, null, 2));
    
    const result = await db.update(users).set(sanitizedUpdates).where(eq(users.id, id)).returning();
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

  async getBidsByHostId(hostId: number): Promise<Bid[]> {
    // Get all bids for events owned by this host
    return await db.select({
      id: bids.id,
      eventId: bids.eventId,
      chefId: bids.chefId,
      amount: bids.amount,
      message: bids.message,
      status: bids.status,
      createdAt: bids.createdAt,
    })
    .from(bids)
    .innerJoin(events, eq(bids.eventId, events.id))
    .where(eq(events.hostId, hostId))
    .orderBy(desc(bids.createdAt));
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

  async getConversationsForUser(userId: number): Promise<any[]> {
    // This would need a more complex query in production
    // For now, return a simplified structure
    return [];
  }

  async markConversationAsRead(userId: number, otherUserId: number): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.senderId, otherUserId)
        )
      );
  }

  async toggleMessageStar(id: number): Promise<Message | undefined> {
    const message = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    if (message[0]) {
      const result = await db.update(messages)
        .set({ isStarred: !message[0].isStarred })
        .where(eq(messages.id, id))
        .returning();
      return result[0];
    }
    return undefined;
  }

  // Chef Availability operations
  async getChefAvailability(chefId: number, startDate: string, endDate: string): Promise<ChefAvailability[]> {
    return await db.select()
      .from(chefAvailability)
      .where(
        and(
          eq(chefAvailability.chefId, chefId),
          between(chefAvailability.date, new Date(startDate), new Date(endDate))
        )
      );
  }

  async createOrUpdateAvailability(availability: InsertChefAvailability): Promise<ChefAvailability> {
    // Try to find existing availability for this date
    const existing = await db.select()
      .from(chefAvailability)
      .where(
        and(
          eq(chefAvailability.chefId, availability.chefId),
          eq(chefAvailability.date, availability.date)
        )
      )
      .limit(1);

    if (existing[0]) {
      // Update existing
      const result = await db.update(chefAvailability)
        .set({
          isAvailable: availability.isAvailable,
          isBooked: availability.isBooked,
          notes: availability.notes,
        })
        .where(eq(chefAvailability.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Create new
      const result = await db.insert(chefAvailability).values(availability).returning();
      return result[0];
    }
  }

  // Payment operations
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db.select()
      .from(payments)
      .where(
        or(
          eq(payments.hostId, userId),
          eq(payments.chefId, userId)
        )
      )
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return result[0];
  }

  // Payment Method operations
  async getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]> {
    return await db.select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(desc(paymentMethods.createdAt));
  }

  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const result = await db.insert(paymentMethods).values(paymentMethod).returning();
    return result[0];
  }

  async removePaymentMethod(id: number): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }
}

export const storage = new DatabaseStorage();
