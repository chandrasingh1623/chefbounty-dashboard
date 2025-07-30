import { pgTable, text, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// SSO accounts table to link providers to users
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // 'facebook' | 'linkedin' | 'local'
  providerAccountId: text("provider_account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  providerAccountIdx: uniqueIndex("accounts_provider_account_idx").on(t.provider, t.providerAccountId),
  userProviderIdx: uniqueIndex("accounts_user_provider_idx").on(t.userId, t.provider),
}));

// Add SSO fields to existing users table (these will be added via migration)
export const ssoUserFields = {
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  headline: text("headline"), // LinkedIn headline
  company: text("company"),
  title: text("title"),
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
};

// Import existing users table to maintain reference
import { users } from "./schema";