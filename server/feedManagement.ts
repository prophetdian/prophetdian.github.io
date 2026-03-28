import { getDb } from "./db";
import { posts, postComments, postLikes, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Create a new post
 */
export async function createPost(
  authorId: number,
  content: string,
  title?: string,
  featuredImage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(posts).values({
      authorId,
      title: title || content.substring(0, 100),
      content,
      featuredImage,
      status: "published",
      publishedAt: new Date(),
    });

    // Return the created post
    const created = await db
      .select()
      .from(posts)
      .where(eq(posts.id, result.insertId))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Get feed posts with pagination
 */
export async function getFeedPosts(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const feedPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offset);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      feedPosts.map(async (post) => {
        const author = await db
          .select()
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1);

        return {
          ...post,
          author: author[0] || null,
        };
      })
    );

    return postsWithAuthors;
  } catch (error) {
    console.error("Error getting feed posts:", error);
    throw error;
  }
}

/**
 * Get user's posts
 */
export async function getUserPosts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const userPosts = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.authorId, userId),
          eq(posts.status, "published")
        )
      )
      .orderBy(desc(posts.publishedAt));

    return userPosts;
  } catch (error) {
    console.error("Error getting user posts:", error);
    throw error;
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: number, authorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Verify ownership
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length === 0 || post[0].authorId !== authorId) {
      throw new Error("Unauthorized to delete this post");
    }

    // Delete associated comments and likes
    // Note: In production, use proper foreign key constraints

    await db.delete(posts).where(eq(posts.id, postId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

/**
 * Like a post
 */
export async function likePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Check if already liked
    const existing = await db
      .select()
      .from(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, message: "Already liked" };
    }

    await db.insert(postLikes).values({
      postId,
      userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .delete(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
}

/**
 * Get likes count for a post
 */
export async function getPostLikesCount(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    return result.length;
  } catch (error) {
    console.error("Error getting post likes count:", error);
    throw error;
  }
}

/**
 * Add comment to post
 */
export async function addComment(postId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(postComments).values({
      postId,
      userId,
      content,
    });

    // Return the created comment
    const created = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, result.insertId))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const comments = await db
      .select()
      .from(postComments)
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));

    // Get author info for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await db
          .select()
          .from(users)
          .where(eq(users.id, comment.userId))
          .limit(1);

        return {
          ...comment,
          author: author[0] || null,
        };
      })
    );

    return commentsWithAuthors;
  } catch (error) {
    console.error("Error getting post comments:", error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Verify ownership
    const comment = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, commentId))
      .limit(1);

    if (comment.length === 0 || comment[0].userId !== userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    await db.delete(postComments).where(eq(postComments.id, commentId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
