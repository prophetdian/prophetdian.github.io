import { getDb } from "./db";
import { orders, naviSubscriptions, badgeSubscriptions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { capturePayPalOrder, getPayPalOrder } from "./paypal";
import { sendPaymentConfirmationEmail } from "./email";

export async function handlePayPalCallback(paypalOrderId: string, dbOrderId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get PayPal order details
    const paypalOrder = await getPayPalOrder(paypalOrderId);

    if (paypalOrder.status === "APPROVED") {
      // Capture the payment
      const captureResult = await capturePayPalOrder(paypalOrderId);

      if (captureResult.status === "COMPLETED") {
        // Update order status
        await db
          .update(orders)
          .set({ status: "completed" })
          .where(eq(orders.id, dbOrderId));

        // Get order details
        const orderData = await db
          .select()
          .from(orders)
          .where(eq(orders.id, dbOrderId))
          .limit(1);

        if (orderData && orderData.length > 0) {
          const order = orderData[0];
          const items = JSON.parse(order.items as string);

          // Create subscription or badge based on order type
          if (items.type === "navi") {
            // Create Navi Society subscription
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await db.insert(naviSubscriptions).values({
              userId: order.userId,
              orderId: dbOrderId,
              status: "active",
              expiresAt: expiresAt,
              createdAt: new Date(),
            });
          } else if (items.type === "badge") {
            // Create badge subscription
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            await db.insert(badgeSubscriptions).values({
              userId: order.userId,
              badgeType: items.badgeType,
              orderId: dbOrderId,
              status: "active",
              expiresAt: expiresAt,
              createdAt: new Date(),
            });
          }

          // Send confirmation email
          const user = await db
            .select()
            .from(require("@/drizzle/schema").users)
            .where(eq(require("@/drizzle/schema").users.id, order.userId))
            .limit(1);

          if (user && user.length > 0) {
            await sendPaymentConfirmationEmail(
              user[0].email,
              order.orderNumber,
              order.totalAmount,
              items.type === "navi" ? "Navi Society Subscription" : `${items.badgeType} Badge`
            );
          }
        }

        return { success: true, message: "Payment processed successfully" };
      }
    }

    throw new Error("Payment not completed");
  } catch (error) {
    console.error("Error handling PayPal callback:", error);
    throw error;
  }
}

export async function handleBankTransferVerification(
  dbOrderId: number,
  transactionId: string
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Update order status
    await db
      .update(orders)
      .set({ status: "completed" })
      .where(eq(orders.id, dbOrderId));

    // Get order details
    const orderData = await db
      .select()
      .from(orders)
      .where(eq(orders.id, dbOrderId))
      .limit(1);

    if (orderData && orderData.length > 0) {
      const order = orderData[0];
      const items = JSON.parse(order.items as string);

      // Create subscription or badge based on order type
      if (items.type === "navi") {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await db.insert(naviSubscriptions).values({
          userId: order.userId,
          orderId: dbOrderId,
          status: "active",
          expiresAt: expiresAt,
          createdAt: new Date(),
        });
      } else if (items.type === "badge") {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await db.insert(badgeSubscriptions).values({
          userId: order.userId,
          badgeType: items.badgeType,
          orderId: dbOrderId,
          status: "active",
          expiresAt: expiresAt,
          createdAt: new Date(),
        });
      }

      // Send confirmation email
      const user = await db
        .select()
        .from(require("@/drizzle/schema").users)
        .where(eq(require("@/drizzle/schema").users.id, order.userId))
        .limit(1);

      if (user && user.length > 0) {
        await sendPaymentConfirmationEmail(
          user[0].email,
          order.orderNumber,
          order.totalAmount,
          items.type === "navi" ? "Navi Society Subscription" : `${items.badgeType} Badge`
        );
      }
    }

    return { success: true, message: "Bank transfer verified successfully" };
  } catch (error) {
    console.error("Error handling bank transfer verification:", error);
    throw error;
  }
}
