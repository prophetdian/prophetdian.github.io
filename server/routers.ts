import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";
import { eq, desc, and, or } from "drizzle-orm";
import { getDb, upsertUser } from "./db";
import { createPayPalOrder, capturePayPalOrder } from "./paypal";
import { sendPaymentConfirmationEmail } from "./email";
import { posts, products, courses, courseEnrollments, cartItems, orders, bankAccounts, notifications, naviPosts, naviSubscriptions, postLikes, postComments, postReactions, postHashtags, postCategories, postAnalytics, commentReplies, conversations, messages, backups, users, badgeSubscriptions } from "../drizzle/schema";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export const appRouter = router({
  system: router({
    notifyOwner: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  posts: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.publishedAt)).limit(input.limit).offset(input.offset);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        featuredImage: z.string().optional(),
        status: z.enum(["draft", "published"]).default("published"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.insert(posts).values({
          authorId: ctx.user.id,
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          featuredImage: input.featuredImage,
          status: input.status,
          publishedAt: input.status === "published" ? new Date() : null,
        });
        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
        if (!post || post.length === 0) throw new Error("Post not found");
        if (post[0].authorId !== ctx.user.id) throw new Error("You can only delete your own posts");
        
        return db.delete(posts).where(eq(posts.id, input.postId));
      }),

    getUserPosts: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const targetUserId = input.userId || ctx.user.id;
        return db.select().from(posts)
          .where(eq(posts.authorId, targetUserId))
          .orderBy(desc(posts.publishedAt));
      }),
  }),

  naviSociety: router({
    getPosts: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        const subscription = await db.select().from(naviSubscriptions)
          .where(eq(naviSubscriptions.userId, ctx.user.id))
          .limit(1);
        
        if (!subscription || subscription.length === 0 || subscription[0].status !== "active") {
          throw new Error("Not a Navi Society member");
        }
        
        return db.select().from(naviPosts).where(eq(naviPosts.status, "published"));
      }),

    createPost: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        featuredImage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const isAuthorized = ctx.user.email === "prophetdian@gmail.com" || ctx.user.hasPastorBadge;
        if (!isAuthorized) {
          throw new Error("You are not authorized to post in Navi Society");
        }
        
        const result = await db.insert(naviPosts).values({
          authorId: ctx.user.id,
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          featuredImage: input.featuredImage,
          status: "published",
          publishedAt: new Date(),
        });
        return result;
      }),

    subscribe: protectedProcedure
      .input(z.object({
        paymentMethod: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await db.select().from(naviSubscriptions)
          .where(eq(naviSubscriptions.userId, ctx.user.id))
          .limit(1);
        
        if (existing && existing.length > 0) {
          await db.update(naviSubscriptions)
            .set({
              status: "active",
              renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .where(eq(naviSubscriptions.userId, ctx.user.id));
          return { success: true, isNew: false };
        }
        
        const result = await db.insert(naviSubscriptions).values({
          userId: ctx.user.id,
          status: "active",
          createdAt: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        return { success: true, isNew: true, subscriptionId: result[0]?.id || 0 };
      }),

    getSubscription: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return null;
        const subscription = await db.select().from(naviSubscriptions)
          .where(eq(naviSubscriptions.userId, ctx.user.id))
          .limit(1);
        return subscription.length > 0 ? subscription[0] : null;
      }),
  }),

  messages: router({
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        const convs = await db.select().from(conversations)
          .where(
            or(
              eq(conversations.user1Id, ctx.user.id),
              eq(conversations.user2Id, ctx.user.id)
            )
          )
          .orderBy(desc(conversations.lastMessageAt));
        
        const enriched = await Promise.all(
          convs.map(async (conv: any) => {
            const otherUserId = conv.user1Id === ctx.user.id ? conv.user2Id : conv.user1Id;
            const otherUser = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);
            const lastMsg = await db.select().from(messages)
              .where(eq(messages.conversationId, conv.id))
              .orderBy(desc(messages.createdAt))
              .limit(1);
            
            return {
              ...conv,
              otherUserName: otherUser[0]?.name || otherUser[0]?.username || 'User',
              lastMessage: lastMsg[0]?.content || 'No messages yet',
            };
          })
        );
        
        return enriched;
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select().from(messages)
          .where(eq(messages.conversationId, input.conversationId))
          .orderBy(desc(messages.createdAt));
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(messages).values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          content: input.content,
          isRead: false,
        });
        
        await db.update(conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(conversations.id, input.conversationId));
        
        return result;
      }),

    createConversation: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await db.select().from(conversations)
          .where(
            or(
              and(eq(conversations.user1Id, ctx.user.id), eq(conversations.user2Id, input.userId)),
              and(eq(conversations.user1Id, input.userId), eq(conversations.user2Id, ctx.user.id))
            )
          )
          .limit(1);
        
        if (existing.length > 0) {
          const otherUser = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
          return {
            ...existing[0],
            otherUserName: otherUser[0]?.name || otherUser[0]?.username || 'User',
          };
        }
        
        const result = await db.insert(conversations).values({
          user1Id: ctx.user.id,
          user2Id: input.userId,
        });
        
        const otherUser = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
        
        return {
          id: result[0]?.id || 0,
          user1Id: ctx.user.id,
          user2Id: input.userId,
          otherUserName: otherUser[0]?.name || otherUser[0]?.username || 'User',
        };
      }),

    searchUsers: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select().from(users).limit(10);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.update(messages)
          .set({ isRead: true, readAt: new Date() })
          .where(eq(messages.id, input.messageId));
      }),

    backupData: protectedProcedure
      .input(z.object({ backupType: z.enum(["posts", "messages", "all"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        let data: any = {};
        
        if (input.backupType === "posts" || input.backupType === "all") {
          const userPosts = await db.select().from(posts).where(eq(posts.authorId, ctx.user.id));
          data.posts = userPosts;
        }
        
        if (input.backupType === "messages" || input.backupType === "all") {
          const userConversations = await db.select().from(conversations)
            .where(
              or(
                eq(conversations.user1Id, ctx.user.id),
                eq(conversations.user2Id, ctx.user.id)
              )
            );
          
          const convIds = userConversations.map((c: any) => c.id);
          const userMessages = convIds.length > 0 
            ? await db.select().from(messages)
                .where((m: any) => convIds.includes(m.conversationId))
            : [];
          
          data.messages = userMessages;
          data.conversations = userConversations;
        }
        
        const fileName = `backup-${input.backupType}-${Date.now()}.json`;
        const dataJson = JSON.stringify(data, null, 2);
        const fileSize = Buffer.byteLength(dataJson);
        
        const result = await db.insert(backups).values({
          userId: ctx.user.id,
          backupType: input.backupType,
          dataJson,
          fileName,
          fileSize,
          status: "completed",
          completedAt: new Date(),
        });
        
        return { success: true, fileName, fileSize };
      }),

    getBackups: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select().from(backups)
          .where(eq(backups.userId, ctx.user.id))
          .orderBy(desc(backups.createdAt));
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(products);
    }),
  }),

  orders: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["navi", "badge"]),
        badgeType: z.string().optional(),
        paymentMethod: z.string(),
        amount: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const orderNumber = `ORD-${Date.now()}-${nanoid(8)}`;
        const result = await db.insert(orders).values({
          userId: ctx.user.id,
          orderNumber: orderNumber,
          totalAmount: input.amount.toString(),
          paymentMethod: input.paymentMethod as "paypal" | "bank-transfer",
          items: JSON.stringify({
            type: input.type,
            badgeType: input.badgeType,
            amount: input.amount,
          }),
          status: "pending",
          createdAt: new Date(),
        });
        
        return { success: true, orderId: result[0]?.id || 0, orderNumber: orderNumber };
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(orders)
          .where(eq(orders.userId, ctx.user.id))
          .orderBy(desc(orders.createdAt));
      }),

    capture: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        paypalOrderId: z.string().optional(),
        type: z.enum(["navi", "badge"]),
        badgeType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        try {
          // If PayPal order ID provided, capture the payment
          if (input.paypalOrderId) {
            const captureResult = await capturePayPalOrder(input.paypalOrderId);
            
            if (captureResult.status !== "COMPLETED") {
              throw new Error("Payment not completed");
            }
          }

          // Update order status to completed
          await db.update(orders)
            .set({ status: "completed" })
            .where(and(
              eq(orders.id, input.orderId),
              eq(orders.userId, ctx.user.id)
            ));

          const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const subscriptionStartDate = new Date();

          // Create or update Navi subscription
          if (input.type === "navi") {
            const existing = await db.select().from(naviSubscriptions)
              .where(eq(naviSubscriptions.userId, ctx.user.id))
              .limit(1);
            
            if (existing && existing.length > 0) {
              await db.update(naviSubscriptions)
                .set({
                  status: "active",
                  renewalDate: renewalDate,
                })
                .where(eq(naviSubscriptions.userId, ctx.user.id));
            } else {
              await db.insert(naviSubscriptions).values({
                userId: ctx.user.id,
                status: "active",
                createdAt: subscriptionStartDate,
                renewalDate: renewalDate,
              });
            }
          }

          // Create or update badge subscription
          if (input.type === "badge" && input.badgeType) {
            const existing = await db.select().from(badgeSubscriptions)
              .where(and(
                eq(badgeSubscriptions.userId, ctx.user.id),
                eq(badgeSubscriptions.badgeType, input.badgeType)
              ))
              .limit(1);
            
            if (existing && existing.length > 0) {
              await db.update(badgeSubscriptions)
                .set({
                  status: "active",
                  renewalDate: renewalDate,
                })
                .where(and(
                  eq(badgeSubscriptions.userId, ctx.user.id),
                  eq(badgeSubscriptions.badgeType, input.badgeType)
                ));
            } else {
              await db.insert(badgeSubscriptions).values({
                userId: ctx.user.id,
                badgeType: input.badgeType,
                status: "active",
                createdAt: subscriptionStartDate,
                renewalDate: renewalDate,
              });
            }
          }

          // Send payment confirmation email
          const orderData = await db.select().from(orders)
            .where(eq(orders.id, input.orderId))
            .limit(1);
          
          if (orderData && orderData.length > 0) {
            const order = orderData[0];
            const orderNumber = order.orderNumber || `ORD-${input.orderId}`;
            const amount = parseFloat(order.totalAmount.toString());
            
            await sendPaymentConfirmationEmail({
              userEmail: ctx.user.email || "",
              userName: ctx.user.name || "User",
              orderNumber: orderNumber,
              orderType: input.type,
              badgeType: input.badgeType,
              amount: amount,
              paymentMethod: (order.paymentMethod as "paypal" | "bank-transfer") || "paypal",
              subscriptionStartDate: subscriptionStartDate,
              renewalDate: renewalDate,
            });
          }

          return { status: "success", success: true };
        } catch (error) {
          console.error("Payment capture error:", error);
          throw new Error("Failed to process payment");
        }
      }),

  }),

  badges: router({
    getShop: publicProcedure.query(() => [
      { id: "pastor", name: "Pastor", price: 5, color: "#00F7FF", icon: "🙏" },
      { id: "teacher", name: "Teacher", price: 5, color: "#00F7FF", icon: "📚" },
      { id: "evangelist", name: "Evangelist", price: 5, color: "#00F7FF", icon: "📢" },
      { id: "apostle", name: "Apostle", price: 10, color: "#00F7FF", icon: "⚔️" },
      { id: "prophet", name: "Prophet", price: 10, color: "#FA00FF", icon: "👁️" },
    ]),

    getUserBadges: protectedProcedure
      .input(z.object({ userId: z.number().optional() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const targetUserId = input.userId || ctx.user.id;
        return db.select().from(badgeSubscriptions)
          .where(and(
            eq(badgeSubscriptions.userId, targetUserId),
            eq(badgeSubscriptions.status, "active")
          ));
      }),

    purchaseBadge: protectedProcedure
      .input(z.object({
        badgeType: z.enum(["pastor", "teacher", "evangelist", "apostle", "prophet"]),
        paymentMethod: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const existing = await db.select().from(badgeSubscriptions)
          .where(and(
            eq(badgeSubscriptions.userId, ctx.user.id),
            eq(badgeSubscriptions.badgeType, input.badgeType)
          ))
          .limit(1);
        
        if (existing && existing.length > 0) {
          await db.update(badgeSubscriptions)
            .set({
              status: "active",
              renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .where(and(
              eq(badgeSubscriptions.userId, ctx.user.id),
              eq(badgeSubscriptions.badgeType, input.badgeType)
            ));
          return { success: true, isNew: false, badgeId: existing[0].id };
        }

        const result = await db.insert(badgeSubscriptions).values({
          userId: ctx.user.id,
          badgeType: input.badgeType,
          status: "active",
          createdAt: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return { success: true, isNew: true, badgeId: result[0]?.id || 0 };
      }),

    assignPermanentBadge: adminProcedure
      .input(z.object({
        userId: z.number(),
        badgeType: z.enum(["pastor", "teacher", "evangelist", "apostle", "prophet"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(badgeSubscriptions).values({
          userId: input.userId,
          badgeType: input.badgeType,
          isPermanent: true,
          monthlyPrice: "0",
          status: "active",
        });

        return { success: true, badgeId: result[0]?.id || 0 };
      }),

    cancelBadge: protectedProcedure
      .input(z.object({ badgeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const badge = await db.select().from(badgeSubscriptions)
          .where(eq(badgeSubscriptions.id, input.badgeId))
          .limit(1);

        if (!badge || badge.length === 0) throw new Error("Badge not found");
        if (badge[0].userId !== ctx.user.id) throw new Error("Unauthorized");
        if (badge[0].isPermanent) throw new Error("Cannot cancel permanent badge");

        return db.update(badgeSubscriptions)
          .set({ status: "cancelled" })
          .where(eq(badgeSubscriptions.id, input.badgeId));
      }),

    getActiveBadges: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(badgeSubscriptions)
          .where(and(
            eq(badgeSubscriptions.userId, ctx.user.id),
            eq(badgeSubscriptions.status, "active")
          ));
      }),

    renewBadge: protectedProcedure
      .input(z.object({ badgeId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const badge = await db.select().from(badgeSubscriptions)
          .where(eq(badgeSubscriptions.id, input.badgeId))
          .limit(1);

        if (!badge || badge.length === 0) throw new Error("Badge not found");
        if (badge[0].userId !== ctx.user.id) throw new Error("Unauthorized");
        if (badge[0].isPermanent) throw new Error("Permanent badges auto-renew");

        const newRenewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        return db.update(badgeSubscriptions)
          .set({
            status: "active",
            renewalDate: newRenewalDate,
            updatedAt: new Date(),
          })
          .where(eq(badgeSubscriptions.id, input.badgeId));
      }),

    processRenewals: adminProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      const expiredBadges = await db.select().from(badgeSubscriptions)
        .where(eq(badgeSubscriptions.status, "active"));

      let renewedCount = 0;
      let failedCount = 0;

      for (const badge of expiredBadges) {
        try {
          if (badge.isPermanent) {
            continue;
          }

          if (badge.renewalDate && badge.renewalDate <= now) {
            const newRenewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await db.update(badgeSubscriptions)
              .set({
                renewalDate: newRenewalDate,
                updatedAt: new Date(),
              })
              .where(eq(badgeSubscriptions.id, badge.id));

            renewedCount++;
          }
        } catch (error) {
          failedCount++;
          await db.update(badgeSubscriptions)
            .set({ status: "expired" })
            .where(eq(badgeSubscriptions.id, badge.id));
        }
      }

      return { renewedCount, failedCount, totalProcessed: expiredBadges.length };
    }),

    checkExpiredBadges: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const now = new Date();
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      return db.select().from(badgeSubscriptions)
        .where(and(
          eq(badgeSubscriptions.userId, ctx.user.id),
          eq(badgeSubscriptions.status, "active")
        ));
    }),
  }),

  payments: router({
    createPayPalOrder: protectedProcedure
      .input(z.object({
        type: z.enum(["navi", "badge"]),
        badgeType: z.string().optional(),
        amount: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const orderNumber = `ORD-${Date.now()}-${nanoid(8)}`;
          const result = await db.insert(orders).values({
            userId: ctx.user.id,
            orderNumber: orderNumber,
            totalAmount: input.amount.toString(),
            paymentMethod: "paypal",
            items: JSON.stringify({
              type: input.type,
              badgeType: input.badgeType,
              amount: input.amount,
            }),
            status: "pending",
            createdAt: new Date(),
          });

          const paypalOrder = await createPayPalOrder(
            input.amount,
            input.type === "navi" ? "Navi Society Subscription" : `${input.badgeType} Badge Subscription`,
            ctx.user.email || "user@example.com",
            ctx.user.name || "User"
          );

          return {
            success: true,
            orderId: result[0]?.id || 0,
            orderNumber: orderNumber,
            paypalOrderId: paypalOrder,
            approvalUrl: `https://www.paypal.com/checkoutnow?token=${paypalOrder}`,
          };
        } catch (error) {
          console.error("PayPal order creation error:", error);
          throw new Error("Failed to create PayPal order");
        }
      }),

    createBankTransfer: protectedProcedure
      .input(z.object({
        type: z.enum(["navi", "badge"]),
        badgeType: z.string().optional(),
        amount: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const orderNumber = `ORD-${Date.now()}-${nanoid(8)}`;
          const result = await db.insert(orders).values({
            userId: ctx.user.id,
            orderNumber: orderNumber,
            totalAmount: input.amount.toString(),
            paymentMethod: "bank-transfer",
            items: JSON.stringify({
              type: input.type,
              badgeType: input.badgeType,
              amount: input.amount,
            }),
            status: "pending",
            createdAt: new Date(),
          });

          return {
            success: true,
            orderId: result[0]?.id || 0,
            orderNumber: orderNumber,
            message: "Bank transfer details have been sent to your email",
          };
        } catch (error) {
          console.error("Bank transfer order creation error:", error);
          throw new Error("Failed to create bank transfer order");
        }
      }),
  }),

  profile: router({
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        username: z.string().optional(),
        bio: z.string().optional(),
        profilePicture: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const updateData: any = {
            updatedAt: new Date(),
          };

          if (input.name !== undefined) updateData.name = input.name;
          if (input.username !== undefined) updateData.username = input.username;
          if (input.bio !== undefined) updateData.bio = input.bio;
          if (input.profilePicture !== undefined) updateData.profilePicture = input.profilePicture;

          const result = await db.update(users)
            .set(updateData)
            .where(eq(users.id, ctx.user.id));

          return { success: true, message: "Profile updated successfully" };
        } catch (error) {
          console.error("Profile update error:", error);
          throw new Error("Failed to update profile");
        }
      }),

    uploadPicture: protectedProcedure
      .input(z.object({
        pictureUrl: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          await db.update(users)
            .set({
              profilePicture: input.pictureUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.id, ctx.user.id));

          return { success: true, url: input.pictureUrl };
        } catch (error) {
          console.error("Picture upload error:", error);
          throw new Error("Failed to upload picture");
        }
      }),

    get: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
          return user[0] || null;
        } catch (error) {
          console.error("Get profile error:", error);
          return null;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
