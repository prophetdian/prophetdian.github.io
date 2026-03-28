import { getDb } from "./db";
import { paymentMethods } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Add a new payment method for a user
 */
export async function addPaymentMethod(
  userId: number,
  methodType: "paypal" | "bank-transfer" | "credit-card",
  details: {
    paypalEmail?: string;
    bankAccountId?: number;
    cardLast4?: string;
    cardBrand?: string;
  },
  isDefault: boolean = false
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, userId));
    }

    const result = await db.insert(paymentMethods).values({
      userId,
      methodType,
      paypalEmail: details.paypalEmail,
      bankAccountId: details.bankAccountId,
      cardLast4: details.cardLast4,
      cardBrand: details.cardBrand,
      isDefault,
      isActive: true,
    });

    return { success: true, id: result.insertId };
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw error;
  }
}

/**
 * Get all payment methods for a user
 */
export async function getPaymentMethods(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const methods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));

    return methods;
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw error;
  }
}

/**
 * Get default payment method for a user
 */
export async function getDefaultPaymentMethod(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.userId, userId),
          eq(paymentMethods.isDefault, true),
          eq(paymentMethods.isActive, true)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting default payment method:", error);
    throw error;
  }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(userId: number, methodId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Unset all other defaults
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));

    // Set this one as default
    await db
      .update(paymentMethods)
      .set({ isDefault: true })
      .where(
        and(
          eq(paymentMethods.id, methodId),
          eq(paymentMethods.userId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw error;
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(userId: number, methodId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Check if this is the default method
    const method = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, methodId),
          eq(paymentMethods.userId, userId)
        )
      )
      .limit(1);

    if (method.length === 0) {
      throw new Error("Payment method not found");
    }

    // Delete the method
    await db
      .delete(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, methodId),
          eq(paymentMethods.userId, userId)
        )
      );

    // If it was default, set another as default
    if (method[0].isDefault) {
      const remaining = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.userId, userId))
        .limit(1);

      if (remaining.length > 0) {
        await db
          .update(paymentMethods)
          .set({ isDefault: true })
          .where(eq(paymentMethods.id, remaining[0].id));
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
  userId: number,
  methodId: number,
  updates: {
    paypalEmail?: string;
    cardLast4?: string;
    cardBrand?: string;
    isActive?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(paymentMethods)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paymentMethods.id, methodId),
          eq(paymentMethods.userId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
}
