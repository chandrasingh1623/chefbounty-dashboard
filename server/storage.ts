import dotenv from 'dotenv';
dotenv.config();

import { 
  users, 
  events, 
  bids, 
  messages, 
  notifications,
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
  type Notification,
  type InsertNotification,
  type ChefAvailability,
  type InsertChefAvailability,
  type Payment,
  type InsertPayment,
  type PaymentMethod,
  type InsertPaymentMethod
} from "@shared/schema";
import { eq, desc, and, between, or, not } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const db = sql ? drizzle(sql) : null;

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
  getEventsByStatus(status: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined>;

  // Bid operations
  getBidsByEventId(eventId: number): Promise<Bid[]>;
  getBidsByChefId(chefId: number): Promise<Bid[]>;
  getBidsByHostId(hostId: number): Promise<any[]>;
  getBidById(id: number): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBidStatus(id: number, status: string): Promise<Bid | undefined>;
  rejectOtherBidsForEvent(eventId: number, acceptedBidId: number): Promise<void>;

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

  // Notification operations
  getNotificationsByUserId(userId: number, limit?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
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
    // Only return approved events for public viewing
    return await db.select().from(events)
      .where(eq(events.status, 'approved'))
      .orderBy(desc(events.createdAt));
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getEventsByHostId(hostId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.hostId, hostId)).orderBy(desc(events.createdAt));
  }

  async getEventsByStatus(status: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.status, status)).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return result[0];
  }

  async getBidsByEventId(eventId: number): Promise<any[]> {
    // Include chef qualifications for bids on specific events
    return await db.select({
      id: bids.id,
      eventId: bids.eventId,
      chefId: bids.chefId,
      amount: bids.amount,
      message: bids.message,
      status: bids.status,
      createdAt: bids.createdAt,
      chef: {
        id: users.id,
        name: users.name,
        profilePhoto: users.profilePhoto,
        rating: users.rating,
        email: users.email,
        // Qualification fields for enhanced bid display
        specialties: users.specialties,
        experience: users.experience,
        maxTravelDistance: users.maxTravelDistance,
        foodSafetyCertifications: users.foodSafetyCertifications,
        formalTraining: users.formalTraining,
        workHistory: users.workHistory,
        availableServices: users.availableServices,
        maxPartySize: users.maxPartySize,
      }
    })
    .from(bids)
    .innerJoin(users, eq(bids.chefId, users.id))
    .where(eq(bids.eventId, eventId))
    .orderBy(desc(bids.createdAt));
  }

  async getBidsByChefId(chefId: number): Promise<any[]> {
    // First get the basic bids
    const bidResults = await db.select()
      .from(bids)
      .where(eq(bids.chefId, chefId))
      .orderBy(desc(bids.createdAt));

    // Enhance with event and host data
    const enhancedBids = [];
    for (const bid of bidResults) {
      const eventResult = await db.select()
        .from(events)
        .where(eq(events.id, bid.eventId))
        .limit(1);
      
      const event = eventResult[0];
      let host = null;
      
      if (event) {
        const hostResult = await db.select()
          .from(users)
          .where(eq(users.id, event.hostId))
          .limit(1);
        host = hostResult[0];
      }

      enhancedBids.push({
        ...bid,
        event: event || null,
        host: host || null
      });
    }
    
    return enhancedBids;
  }

  async getBidsByHostId(hostId: number): Promise<any[]> {
    // Get all bids for events owned by this host with chef qualifications and event information
    return await db.select({
      id: bids.id,
      eventId: bids.eventId,
      chefId: bids.chefId,
      amount: bids.amount,
      message: bids.message,
      status: bids.status,
      createdAt: bids.createdAt,
      chef: {
        id: users.id,
        name: users.name,
        profilePhoto: users.profilePhoto,
        rating: users.rating,
        email: users.email,
        // Qualification fields for enhanced bid display
        specialties: users.specialties,
        experience: users.experience,
        maxTravelDistance: users.maxTravelDistance,
        foodSafetyCertifications: users.foodSafetyCertifications,
        formalTraining: users.formalTraining,
        workHistory: users.workHistory,
        availableServices: users.availableServices,
        maxPartySize: users.maxPartySize,
      },
      event: {
        id: events.id,
        title: events.title,
      }
    })
    .from(bids)
    .innerJoin(events, eq(bids.eventId, events.id))
    .innerJoin(users, eq(bids.chefId, users.id))
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

  async rejectOtherBidsForEvent(eventId: number, acceptedBidId: number): Promise<void> {
    // Reject all other pending bids for this event
    await db.update(bids)
      .set({ status: 'rejected' })
      .where(
        and(
          eq(bids.eventId, eventId),
          eq(bids.status, 'pending'),
          not(eq(bids.id, acceptedBidId))
        )
      );
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getMessagesForUser(userId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.receiverId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.receiverId, userId1)
          )
        )
      )
      .orderBy(messages.createdAt); // Change to ascending for chat order
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
    // Get unique conversations by finding users who have exchanged messages with the current user
    const userMessages = await db.select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      content: messages.content,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      eventId: messages.eventId
    })
    .from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    )
    .orderBy(desc(messages.createdAt));

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    for (const message of userMessages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(partnerId)) {
        // Get partner info
        const partner = await this.getUser(partnerId);
        if (partner) {
          conversationMap.set(partnerId, {
            participantId: partnerId,
            participant: {
              id: partner.id,
              name: partner.name,
              profilePhoto: partner.profilePhoto,
              role: partner.role,
            },
            lastMessage: {
              id: message.id,
              content: message.content,
              createdAt: message.createdAt,
              isRead: message.isRead,
              senderId: message.senderId,
            },
            unreadCount: 0,
            eventId: message.eventId
          });
        }
      }
      
      // Count unread messages from this partner
      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationMap.get(partnerId);
        if (conversation) {
          conversation.unreadCount++;
        }
      }
    }

    return Array.from(conversationMap.values());
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

  async getSentConversationsForUser(userId: number): Promise<any[]> {
    // Get all messages where user is the sender
    const sentMessages = await db.select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      content: messages.content,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      receiverName: alias(users, 'receiver').name,
      receiverRole: alias(users, 'receiver').role,
      receiverPhoto: alias(users, 'receiver').profilePhoto,
    })
    .from(messages)
    .leftJoin(alias(users, 'receiver'), eq(messages.receiverId, alias(users, 'receiver').id))
    .where(eq(messages.senderId, userId))
    .orderBy(desc(messages.createdAt));

    // Group messages by receiver
    const conversationMap = new Map<number, any>();
    
    for (const message of sentMessages) {
      const receiverId = message.receiverId;
      
      if (!conversationMap.has(receiverId)) {
        conversationMap.set(receiverId, {
          participantId: receiverId,
          participant: {
            id: receiverId,
            name: message.receiverName,
            profilePhoto: message.receiverPhoto,
            role: message.receiverRole,
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            senderId: message.senderId,
          },
          unreadCount: 0, // Sent messages don't have unread count for sender
          eventId: null,
        });
      } else {
        // Update with latest message if this one is newer
        const existing = conversationMap.get(receiverId);
        if (new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
          existing.lastMessage = {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            senderId: message.senderId,
          };
        }
      }
    }
    
    return Array.from(conversationMap.values());
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

  // Notification operations
  async getNotificationsByUserId(userId: number, limit: number = 8): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // Event deletion
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Bid deletion
  async deleteBid(id: number): Promise<boolean> {
    const result = await db.delete(bids).where(eq(bids.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
