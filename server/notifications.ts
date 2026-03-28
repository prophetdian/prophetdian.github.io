import { db } from "./db";
import { notifications } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function createNotification(
  userId: number,
  type: "like" | "comment" | "mention",
  relatedPostId: number,
  relatedCommentId?: number,
  createdBy?: number
) {
  try {
    const result = await db.insert(notifications).values({
      userId,
      type,
      relatedPostId,
      relatedCommentId,
      createdBy,
      isRead: false,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function getNotifications(userId: number, limit = 20) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
    return userNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

export async function getUnreadNotificationCount(userId: number) {
  try {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(eq(notifications.userId, userId));
    return result.length;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
}

export async function deleteNotification(notificationId: number) {
  try {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}
