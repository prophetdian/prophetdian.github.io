
    capture: protectedProcedure
      .input(z.object({
        paypalOrderId: z.string(),
        type: z.enum(["navi", "badge"]),
        badgeType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        try {
          const captureResult = await capturePayPalOrder(input.paypalOrderId);
          
          if (captureResult.status === "COMPLETED") {
            await db.update(orders)
              .set({ status: "completed" })
              .where(and(
                eq(orders.userId, ctx.user.id),
                eq(orders.paypalOrderId, input.paypalOrderId)
              ));

            if (input.type === "navi") {
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
              } else {
                await db.insert(naviSubscriptions).values({
                  userId: ctx.user.id,
                  status: "active",
                  createdAt: new Date(),
                  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                });
              }
            }

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
                    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
                  createdAt: new Date(),
                  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                });
              }
            }

            return { status: "success", success: true };
          } else {
            throw new Error("Payment not completed");
          }
        } catch (error) {
          console.error("Payment capture error:", error);
          throw new Error("Failed to process payment");
        }
      }),
