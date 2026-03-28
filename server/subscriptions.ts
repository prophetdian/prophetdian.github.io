import { getDb } from "./db";
import { naviSubscriptions, badgeSubscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Pause a subscription with optional reason
 */
export async function pauseSubscription(
  subscriptionId: number,
  type: "navi" | "badge",
  reason?: string,
  resumeDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    if (type === "navi") {
      await db
        .update(naviSubscriptions)
        .set({
          status: "paused",
          pausedAt: new Date(),
          pauseReason: reason,
          resumeDate: resumeDate,
          updatedAt: new Date(),
        })
        .where(eq(naviSubscriptions.id, subscriptionId));
    } else {
      await db
        .update(badgeSubscriptions)
        .set({
          status: "paused",
          pausedAt: new Date(),
          resumeDate: resumeDate,
          updatedAt: new Date(),
        })
        .where(eq(badgeSubscriptions.id, subscriptionId));
    }

    return { success: true, message: "Subscription paused successfully" };
  } catch (error) {
    console.error("Error pausing subscription:", error);
    throw error;
  }
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: number, type: "navi" | "badge") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    if (type === "navi") {
      await db
        .update(naviSubscriptions)
        .set({
          status: "active",
          pausedAt: null,
          pauseReason: null,
          resumeDate: null,
          renewalDate: renewalDate,
          updatedAt: new Date(),
        })
        .where(eq(naviSubscriptions.id, subscriptionId));
    } else {
      await db
        .update(badgeSubscriptions)
        .set({
          status: "active",
          pausedAt: null,
          resumeDate: null,
          renewalDate: renewalDate,
          updatedAt: new Date(),
        })
        .where(eq(badgeSubscriptions.id, subscriptionId));
    }

    return { success: true, message: "Subscription resumed successfully" };
  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw error;
  }
}

/**
 * Get pause details for a subscription
 */
export async function getPauseDetails(subscriptionId: number, type: "navi" | "badge") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    if (type === "navi") {
      const result = await db
        .select()
        .from(naviSubscriptions)
        .where(eq(naviSubscriptions.id, subscriptionId))
        .limit(1);

      if (result.length === 0) return null;

      const sub = result[0];
      return {
        id: sub.id,
        status: sub.status,
        pausedAt: sub.pausedAt,
        pauseReason: sub.pauseReason,
        resumeDate: sub.resumeDate,
      };
    } else {
      const result = await db
        .select()
        .from(badgeSubscriptions)
        .where(eq(badgeSubscriptions.id, subscriptionId))
        .limit(1);

      if (result.length === 0) return null;

      const sub = result[0];
      return {
        id: sub.id,
        status: sub.status,
        pausedAt: sub.pausedAt,
        resumeDate: sub.resumeDate,
      };
    }
  } catch (error) {
    console.error("Error getting pause details:", error);
    throw error;
  }
}
