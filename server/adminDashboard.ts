import { db } from "./db";
import { posts, postComments, users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllPosts(limit = 50, offset = 0) {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
    return allPosts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
}

export async function deletePostAsAdmin(postId: number, reason: string) {
  try {
    // Log the deletion
    console.log(`Admin deleted post ${postId}. Reason: ${reason}`);
    
    // Delete the post
    await db.delete(posts).where(eq(posts.id, postId));
    
    return { success: true, message: "Post deleted successfully" };
  } catch (error) {
    console.error("Error deleting post as admin:", error);
    throw error;
  }
}

export async function deleteCommentAsAdmin(commentId: number, reason: string) {
  try {
    // Log the deletion
    console.log(`Admin deleted comment ${commentId}. Reason: ${reason}`);
    
    // Delete the comment
    await db.delete(postComments).where(eq(postComments.id, commentId));
    
    return { success: true, message: "Comment deleted successfully" };
  } catch (error) {
    console.error("Error deleting comment as admin:", error);
    throw error;
  }
}

export async function getAllUsers(limit = 50, offset = 0) {
  try {
    const allUsers = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset);
    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function suspendUser(userId: number, reason: string) {
  try {
    console.log(`Admin suspended user ${userId}. Reason: ${reason}`);
    
    // Update user status
    await db
      .update(users)
      .set({ status: "suspended" as any })
      .where(eq(users.id, userId));
    
    return { success: true, message: "User suspended successfully" };
  } catch (error) {
    console.error("Error suspending user:", error);
    throw error;
  }
}

export async function unsuspendUser(userId: number) {
  try {
    console.log(`Admin unsuspended user ${userId}`);
    
    await db
      .update(users)
      .set({ status: "active" as any })
      .where(eq(users.id, userId));
    
    return { success: true, message: "User unsuspended successfully" };
  } catch (error) {
    console.error("Error unsuspending user:", error);
    throw error;
  }
}

export async function getAdminStats() {
  try {
    const totalUsers = await db.select().from(users);
    const totalPosts = await db.select().from(posts);
    const totalComments = await db.select().from(postComments);
    
    return {
      totalUsers: totalUsers.length,
      totalPosts: totalPosts.length,
      totalComments: totalComments.length,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw error;
  }
}
