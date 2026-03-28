import { db } from "./db";
import { orders } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface BankTransferDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  iban?: string;
  reference: string;
}

// Get bank transfer details for display to user
export function getBankTransferDetails(orderId: string): BankTransferDetails {
  return {
    bankName: "Prophet Dian Financial Services",
    accountHolder: "Prophet Dian Inc",
    accountNumber: "****1234",
    routingNumber: "021000021",
    swiftCode: "CHASUS33",
    iban: "DE89370400440532013000",
    reference: `PROPHET-${orderId}`,
  };
}

// Verify bank transfer payment (called by admin or automated system)
export async function verifyBankTransfer(
  orderId: number,
  transactionId: string,
  amount: number
) {
  try {
    // Update order status to completed
    await db
      .update(orders)
      .set({
        status: "completed",
        paymentMethod: "bank_transfer",
      })
      .where(eq(orders.id, orderId));

    console.log(
      `Bank transfer verified for order ${orderId}. Transaction: ${transactionId}`
    );

    return {
      success: true,
      message: "Bank transfer verified successfully",
      orderId,
    };
  } catch (error) {
    console.error("Error verifying bank transfer:", error);
    throw error;
  }
}

// Mark bank transfer as pending
export async function markBankTransferPending(orderId: number) {
  try {
    await db
      .update(orders)
      .set({
        status: "pending",
        paymentMethod: "bank_transfer",
      })
      .where(eq(orders.id, orderId));

    return {
      success: true,
      message: "Bank transfer marked as pending",
      orderId,
    };
  } catch (error) {
    console.error("Error marking bank transfer as pending:", error);
    throw error;
  }
}

// Cancel bank transfer order
export async function cancelBankTransfer(orderId: number, reason: string) {
  try {
    await db
      .update(orders)
      .set({
        status: "cancelled",
      })
      .where(eq(orders.id, orderId));

    console.log(`Bank transfer cancelled for order ${orderId}. Reason: ${reason}`);

    return {
      success: true,
      message: "Bank transfer cancelled",
      orderId,
    };
  } catch (error) {
    console.error("Error cancelling bank transfer:", error);
    throw error;
  }
}

// Get pending bank transfers (for admin review)
export async function getPendingBankTransfers() {
  try {
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, "pending"));

    return pendingOrders.filter(
      (order) => order.paymentMethod === "bank_transfer"
    );
  } catch (error) {
    console.error("Error getting pending bank transfers:", error);
    throw error;
  }
}
