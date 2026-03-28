import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: number,
  updates: {
    name?: string;
    username?: string;
    bio?: string;
    profilePicture?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Check if username is unique (if being updated)
    if (updates.username) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, updates.username))
        .limit(1);

      if (existing.length > 0 && existing[0].id !== userId) {
        throw new Error("Username already taken");
      }
    }

    await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Return updated user
    const updated = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return updated[0] || null;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Get user profile by username
 */
export async function getUserProfileByUsername(username: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting user profile by username:", error);
    throw error;
  }
}

/**
 * Upload profile picture
 */
export async function updateProfilePicture(userId: number, pictureUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(users)
      .set({
        profilePicture: pictureUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return { success: true, url: pictureUrl };
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
}
