import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'host' or 'chef'
  name: text("name").notNull(),
  profilePhoto: text("profile_photo"),
  bio: text("bio"),
  location: text("location"),
  specialties: text("specialties").array(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  experience: integer("experience"), // years of experience
  featured: boolean("featured").default(false),
  availableNow: boolean("available_now").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cuisineType: text("cuisine_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  duration: integer("duration").notNull(),
  location: text("location").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  venueType: text("venue_type").notNull(), // 'indoor' or 'outdoor'
  eventImage: text("event_image"),
  status: text("status").notNull().default("open"), // 'open', 'closed', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  chefId: integer("chef_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
