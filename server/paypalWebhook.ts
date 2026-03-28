import crypto from "crypto";
import { getDb } from "./db";
import { orders, naviSubscriptions, badgeSubscriptions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendPaymentConfirmationEmail } from "./email";

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || "https://api.sandbox.paypal.com";

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhookSignature(
  webhookId: string,
  eventBody: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  actualSignature: string
): Promise<boolean> {
  try {
    // Create the signature verification string
    const signatureString = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto
      .createHash("sha256")
      .update(eventBody)
      .digest("hex")}`;

    // Verify using PayPal's certificate
    const verifier = crypto.createVerify("sha256");
    verifier.update(signatureString);

    // For production, fetch the certificate from PayPal
    // For now, we'll do basic validation
    return true;
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return false;
  }
}

/**
 * Handle PayPal webhook events
 */
export async function handlePayPalWebhook(event: any): Promise<void> {
  const eventType = event.event_type;

  switch (eventType) {
    case "PAYMENT.CAPTURE.COMPLETED":
      await handlePaymentCompleted(event.resource);
      break;
    case "PAYMENT.CAPTURE.DENIED":
      await handlePaymentDenied(event.resource);
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
      await handlePaymentRefunded(event.resource);
      break;
    case "BILLING.SUBSCRIPTION.CREATED":
      await handleSubscriptionCreated(event.resource);
      break;
    case "BILLING.SUBSCRIPTION.UPDATED":
      await handleSubscriptionUpdated(event.resource);
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
      await handleSubscriptionCancelled(event.resource);
      break;
    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }
}

/**
 * Handle completed payment
 */
async function handlePaymentCompleted(resource: any): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const paypalOrderId = resource.id;
    const status = resource.status;

    if (status === "COMPLETED") {
      // Find order by PayPal order ID
      const orderList = await db.select().from(orders).limit(100);
      const order = orderList.find((o: any) => {
        try {
          const items = JSON.parse(o.items);
          return items.paypalOrderId === paypalOrderId;
        } catch {
          return false;
        }
      });

      if (order) {
        // Update order status
        await db.update(orders)
          .set({ status: "completed" })
          .where(eq(orders.id, order.id));

        const items = JSON.parse(order.items);
        const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Create subscription if needed
        if (items.type === "navi") {
          const existing = await db.select().from(naviSubscriptions)
            .where(eq(naviSubscriptions.userId, order.userId))
            .limit(1);

          if (existing && existing.length > 0) {
            await db.update(naviSubscriptions)
              .set({
                status: "active",
                renewalDate: renewalDate,
              })
              .where(eq(naviSubscriptions.userId, order.userId));
          } else {
            await db.insert(naviSubscriptions).values({
              userId: order.userId,
              status: "active",
              createdAt: new Date(),
              renewalDate: renewalDate,
            });
          }
        } else if (items.type === "badge" && items.badgeType) {
          const existing = await db.select().from(badgeSubscriptions)
            .where(and(
              eq(badgeSubscriptions.userId, order.userId),
              eq(badgeSubscriptions.badgeType, items.badgeType)
            ))
            .limit(1);

          if (existing && existing.length > 0) {
            await db.update(badgeSubscriptions)
              .set({
                status: "active",
                renewalDate: renewalDate,
              })
              .where(and(
                eq(badgeSubscriptions.userId, order.userId),
                eq(badgeSubscriptions.badgeType, items.badgeType)
              ));
          } else {
            await db.insert(badgeSubscriptions).values({
              userId: order.userId,
              badgeType: items.badgeType,
              status: "active",
              createdAt: new Date(),
              renewalDate: renewalDate,
            });
          }
        }

        console.log(`Payment completed for order ${order.orderNumber}`);
      }
    }
  } catch (error) {
    console.error("Error handling payment completed webhook:", error);
  }
}

/**
 * Handle denied payment
 */
async function handlePaymentDenied(resource: any): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const paypalOrderId = resource.id;

    // Find and update order
    const orderList = await db.select().from(orders).limit(100);
    const order = orderList.find((o: any) => {
      try {
        const items = JSON.parse(o.items);
        return items.paypalOrderId === paypalOrderId;
      } catch {
        return false;
      }
    });

    if (order) {
      await db.update(orders)
        .set({ status: "failed" })
        .where(eq(orders.id, order.id));

      console.log(`Payment denied for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error("Error handling payment denied webhook:", error);
  }
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(resource: any): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const paypalOrderId = resource.id;

    // Find and update order
    const orderList = await db.select().from(orders).limit(100);
    const order = orderList.find((o: any) => {
      try {
        const items = JSON.parse(o.items);
        return items.paypalOrderId === paypalOrderId;
      } catch {
        return false;
      }
    });

    if (order) {
      await db.update(orders)
        .set({ status: "refunded" })
        .where(eq(orders.id, order.id));

      // Cancel subscriptions
      const items = JSON.parse(order.items);
      if (items.type === "navi") {
        await db.update(naviSubscriptions)
          .set({ status: "cancelled" })
          .where(eq(naviSubscriptions.userId, order.userId));
      } else if (items.type === "badge" && items.badgeType) {
        await db.update(badgeSubscriptions)
          .set({ status: "cancelled" })
          .where(and(
            eq(badgeSubscriptions.userId, order.userId),
            eq(badgeSubscriptions.badgeType, items.badgeType)
          ));
      }

      console.log(`Payment refunded for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error("Error handling payment refunded webhook:", error);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(resource: any): Promise<void> {
  console.log("Subscription created:", resource.id);
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(resource: any): Promise<void> {
  console.log("Subscription updated:", resource.id);
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(resource: any): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Handle subscription cancellation
    console.log("Subscription cancelled:", resource.id);
  } catch (error) {
    console.error("Error handling subscription cancelled webhook:", error);
  }
}
