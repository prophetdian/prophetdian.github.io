import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { users, naviSubscriptions, badgeSubscriptions, orders } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { sendPaymentConfirmationEmail } from "./email";

/**
 * PayPal Webhook Handler - Enhanced
 * Handles payment.capture.completed events from PayPal with email notifications
 */
export async function handlePayPalWebhook(body: any) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const event = body;
    
    // Handle payment.capture.completed event
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const capture = event.resource;
      const customId = capture.supplementary_data?.related_ids?.order_id;
      
      if (!customId) {
        console.warn("[PayPal Webhook] No order ID found in webhook");
        return { success: false, message: "No order ID found" };
      }

      // Extract user email from custom ID (format: user-email-{timestamp})
      const emailMatch = customId.match(/user-email-(.+?)-\d+$/);
      if (!emailMatch) {
        console.warn("[PayPal Webhook] Could not parse email from custom ID:", customId);
        return { success: false, message: "Could not parse email" };
      }

      const userEmail = emailMatch[1];
      const amount = parseFloat(capture.amount.value);

      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
      if (!userResult || userResult.length === 0) {
        console.warn("[PayPal Webhook] User not found:", userEmail);
        return { success: false, message: "User not found" };
      }

      const user = userResult[0];
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);

      // Check if subscription already exists
      const existingSubscription = await db
        .select()
        .from(naviSubscriptions)
        .where(eq(naviSubscriptions.userId, user.id))
        .limit(1);

      if (existingSubscription && existingSubscription.length > 0) {
        // Update existing subscription
        await db
          .update(naviSubscriptions)
          .set({
            status: "active",
            renewalDate,
            updatedAt: new Date(),
          })
          .where(eq(naviSubscriptions.id, existingSubscription[0].id));
      } else {
        // Create new subscription
        await db.insert(naviSubscriptions).values({
          userId: user.id,
          status: "active",
          monthlyPrice: "500",
          startDate: new Date(),
          renewalDate,
        });
      }

      // Send payment confirmation email
      await sendPaymentConfirmationEmail({
        userEmail: user.email || "",
        userName: user.name || "User",
        orderNumber: customId,
        orderType: "navi",
        amount: amount,
        paymentMethod: "paypal",
        subscriptionStartDate: new Date(),
        renewalDate: renewalDate,
      });

      // Notify owner
      await notifyOwner({
        title: "PayPal Payment Received",
        content: `Payment of $${amount.toFixed(2)} received from ${user.email}. Navi Society subscription activated.`,
      });

      console.log("[PayPal Webhook] Subscription activated for user:", user.email);
      return { success: true, message: "Subscription activated" };
    }

    return { success: false, message: "Unknown event type" };
  } catch (error) {
    console.error("[PayPal Webhook] Error:", error);
    return { success: false, message: "Webhook processing failed" };
  }
}

/**
 * Bank Transfer Webhook Handler
 * Handles bank transfer confirmations
 */
export async function handleBankTransferWebhook(body: any) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { userEmail, amount, transactionId, reference } = body;

    if (!userEmail || !amount || !transactionId) {
      console.warn("[Bank Transfer Webhook] Missing required fields");
      return { success: false, message: "Missing required fields" };
    }

    // Verify payment amount ($500 for Navi Society)
    if (amount !== 500) {
      console.warn("[Bank Transfer Webhook] Invalid payment amount:", amount);
      return { success: false, message: "Invalid payment amount" };
    }

    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    if (!userResult || userResult.length === 0) {
      console.warn("[Bank Transfer Webhook] User not found:", userEmail);
      return { success: false, message: "User not found" };
    }

    const user = userResult[0];

    // Check if subscription already exists
    const existingSubscription = await db
      .select()
      .from(naviSubscriptions)
      .where(eq(naviSubscriptions.userId, user.id))
      .limit(1);

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    if (existingSubscription && existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(naviSubscriptions)
        .set({
          status: "active",
          renewalDate,
          updatedAt: new Date(),
        })
        .where(eq(naviSubscriptions.id, existingSubscription[0].id));
    } else {
      // Create new subscription
      await db.insert(naviSubscriptions).values({
        userId: user.id,
        status: "active",
        monthlyPrice: "500",
        startDate: new Date(),
        renewalDate,
      });
    }

    // Notify owner
    await notifyOwner({
      title: "Bank Transfer Received",
      content: `Bank transfer of $500 received from ${user.email}. Transaction ID: ${transactionId}. Navi Society subscription activated.`,
    });

    console.log("[Bank Transfer Webhook] Subscription activated for user:", user.email);
    return { success: true, message: "Subscription activated" };
  } catch (error) {
    console.error("[Bank Transfer Webhook] Error:", error);
    return { success: false, message: "Webhook processing failed" };
  }
}

/**
 * Webhook signature verification for PayPal
 */
export function verifyPayPalSignature(
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  actualSignature: string,
  webhookBody: string,
  webhookId: string
): boolean {
  // In production, verify the signature using PayPal's certificate
  // For now, we'll accept all webhooks (implement proper verification in production)
  console.log("[PayPal Webhook] Signature verification skipped (implement in production)");
  return true;
}

/**
 * Webhook signature verification for Bank Transfers
 */
export function verifyBankTransferSignature(signature: string, payload: string, secret: string): boolean {
  // Verify HMAC-SHA256 signature
  // In production, use: crypto.createHmac('sha256', secret).update(payload).digest('hex')
  console.log("[Bank Transfer Webhook] Signature verification skipped (implement in production)");
  return true;
}
