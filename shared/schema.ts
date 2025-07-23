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
  
  // Travel preferences
  willingToTravel: boolean("willing_to_travel").default(false),
  maxTravelDistance: integer("max_travel_distance"), // in miles
  customTravelAreas: text("custom_travel_areas").array(),
  
  // Experience & Languages
  experience: integer("experience"), // years of experience
  languagesSpoken: text("languages_spoken").array(),
  
  // Culinary specialties
  specialties: text("specialties").array(),
  signatureDishes: text("signature_dishes").array(),
  dietaryAccommodations: text("dietary_accommodations").array(),
  
  // Credentials & Background
  formalTraining: text("formal_training"),
  foodSafetyCertifications: text("food_safety_certifications").array(),
  workHistory: text("work_history"),
  
  // Media & Gallery
  portfolioImages: text("portfolio_images").array(),
  clientTestimonials: text("client_testimonials").array(),
  videoUrl: text("video_url"),
  
  // Service capabilities
  availableServices: text("available_services").array(),
  lastMinuteBookings: boolean("last_minute_bookings").default(false),
  maxPartySize: integer("max_party_size"),
  bringsOwnEquipment: boolean("brings_own_equipment").default(false),
  equipmentList: text("equipment_list").array(),
  canProvideStaff: boolean("can_provide_staff").default(false),
  
  // Rates & Packages
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  rateUnit: text("rate_unit").default("hour"), // 'hour' or 'guest'
  customPackages: text("custom_packages").array(),
  travelFees: text("travel_fees"),
  equipmentFees: text("equipment_fees"),
  
  // Profile status
  profileLive: boolean("profile_live").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  featured: boolean("featured").default(false),
  availableNow: boolean("available_now").default(false),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  cuisineType: text("cuisine_type").array(), // Multi-select cuisines
  eventDate: timestamp("event_date").notNull(),
  duration: integer("duration").notNull(),
  location: text("location").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  venueType: text("venue_type").notNull(), // 'home', 'commercial_kitchen', 'yacht', etc.
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'open', 'in_progress', 'completed'
  eventImage: text("event_image"),
  
  // 🥘 Cuisine & Meal Info
  allergies: text("allergies").array(),
  mealType: text("meal_type"), // 'brunch', 'dinner', 'buffet', etc.
  beverageService: boolean("beverage_service").default(false),
  alcoholIncluded: boolean("alcohol_included").default(false),
  
  // 🧑‍🍳 Chef Requirements
  chefAttire: text("chef_attire"), // 'casual', 'formal', 'uniform'
  onsiteCooking: boolean("onsite_cooking").default(true),
  servingStaff: boolean("serving_staff").default(false),
  setupCleanup: boolean("setup_cleanup").default(true),
  specialEquipment: text("special_equipment").array(),
  
  // 🏠 Venue Details
  kitchenAvailability: text("kitchen_availability"), // 'full', 'limited', 'none'
  parkingAccessibility: text("parking_accessibility"),
  indoorOutdoor: text("indoor_outdoor"), // 'indoor', 'outdoor', 'both'
  
  // 🎭 Experience & Style
  eventTheme: text("event_theme"),
  liveCooking: boolean("live_cooking").default(false),
  guestDressCode: text("guest_dress_code"),
  
  // 👥 Event Details
  guestCount: integer("guest_count"),
  dietaryRequirements: text("dietary_requirements"),
  serviceStyle: text("service_style"),
  
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
  isStarred: boolean("is_starred").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'bid_accepted', 'new_bid', 'new_message', 'event_update'
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"), // eventId, bidId, messageId, etc.
  relatedType: text("related_type"), // 'event', 'bid', 'message'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// New tables for enhanced features
export const chefAvailability = pgTable("chef_availability", {
  id: serial("id").primaryKey(),
  chefId: integer("chef_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  isAvailable: boolean("is_available").default(true),
  isBooked: boolean("is_booked").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  hostId: integer("host_id").references(() => users.id).notNull(),
  chefId: integer("chef_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed', 'refunded'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  invoiceUrl: text("invoice_url"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  paymentType: text("payment_type").notNull(), // 'Venmo', 'CashApp', 'Zelle', 'PayPal'
  accountIdentifier: text("account_identifier").notNull(), // username, email, or phone
  isDefault: boolean("is_default").default(false),
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
  isStarred: true,
  isArchived: true,
});

export const insertChefAvailabilitySchema = createInsertSchema(chefAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertChefAvailability = z.infer<typeof insertChefAvailabilitySchema>;
export type ChefAvailability = typeof chefAvailability.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
