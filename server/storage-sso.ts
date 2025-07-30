import { accounts } from "@shared/schema-sso";
import { users } from "@shared/schema";
import { eq, and, sql as sqlQuery } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Initialize database only if DATABASE_URL is available
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const db = sql ? drizzle(sql) : null;

export interface Account {
  id: number;
  userId: number;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertAccount {
  userId: number;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface SSOUserFields {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  headline?: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
}

// Account operations
export async function getAccountByProvider(
  provider: string,
  providerAccountId: string
): Promise<Account | undefined> {
  if (!db) {
    console.warn('SSO: Database not initialized, returning undefined');
    return undefined;
  }
  
  const result = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.provider, provider),
        eq(accounts.providerAccountId, providerAccountId)
      )
    )
    .limit(1);
  
  return result[0];
}

export async function getAccountsByUserId(userId: number): Promise<Account[]> {
  if (!db) {
    console.warn('SSO: Database not initialized, returning empty array');
    return [];
  }
  
  return await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));
}

export async function createAccount(account: InsertAccount): Promise<Account> {
  if (!db) {
    console.warn('SSO: Database not initialized, returning mock account');
    return {
      id: Math.floor(Math.random() * 10000),
      ...account,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  const result = await db
    .insert(accounts)
    .values(account)
    .returning();
  
  return result[0];
}

export async function updateAccount(
  id: number,
  updates: Partial<InsertAccount>
): Promise<Account | undefined> {
  if (!db) {
    console.warn('SSO: Database not initialized, returning undefined');
    return undefined;
  }
  
  const result = await db
    .update(accounts)
    .set(updates)
    .where(eq(accounts.id, id))
    .returning();
  
  return result[0];
}

export async function deleteAccount(id: number): Promise<void> {
  if (!db) {
    console.warn('SSO: Database not initialized, skipping delete');
    return;
  }
  
  await db.delete(accounts).where(eq(accounts.id, id));
}

// Update user SSO fields
export async function updateUserSSOFields(
  userId: number,
  fields: SSOUserFields
): Promise<void> {
  if (!db) {
    console.warn('SSO: Database not initialized, skipping update');
    return;
  }
  
  const updateData: any = {};
  
  // Only include non-undefined fields
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value;
    }
  });
  
  if (Object.keys(updateData).length > 0) {
    await db.execute(
      sqlQuery`
        UPDATE users 
        SET ${sqlQuery.raw(
          Object.keys(updateData)
            .map(key => `${key} = ${sqlQuery.placeholder(key)}`)
            .join(', ')
        )}
        WHERE id = ${userId}
      `,
      updateData
    );
  }
}

// Add these to main storage export
export const ssoStorage = {
  getAccountByProvider,
  getAccountsByUserId,
  createAccount,
  updateAccount,
  deleteAccount,
  updateUserSSOFields,
};