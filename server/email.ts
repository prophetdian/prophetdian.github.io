import nodemailer from "nodemailer";

// Email configuration - using Gmail or your email service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "noreply@prophetdian.com",
    pass: process.env.EMAIL_PASSWORD || "",
  },
});

export interface PaymentConfirmationData {
  userEmail: string;
  userName: string;
  orderNumber: string;
  orderType: "navi" | "badge";
  badgeType?: string;
  amount: number;
  paymentMethod: "paypal" | "bank-transfer";
  subscriptionStartDate: Date;
  renewalDate: Date;
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData): Promise<boolean> {
  try {
    const productName = data.orderType === "navi" 
      ? "Navi Society Subscription" 
      : `${data.badgeType} Badge Subscription`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Fredoka', Arial, sans-serif; background-color: #000000; color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; border: 2px solid #FA00FF; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #00F7FF; margin: 0; font-size: 28px; }
            .content { margin: 20px 0; }
            .order-details { background-color: #000000; padding: 15px; border-radius: 5px; border-left: 4px solid #FA00FF; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #333333; }
            .detail-row:last-child { border-bottom: none; }
            .label { color: #00F7FF; font-weight: bold; }
            .value { color: #ffffff; }
            .price { font-size: 24px; color: #FA00FF; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; color: #888888; font-size: 12px; }
            .button { display: inline-block; background: linear-gradient(to right, #00F7FF, #FA00FF); color: #000000; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Payment Confirmed ✨</h1>
              <p>Thank you for your subscription, ${data.userName}!</p>
            </div>

            <div class="content">
              <p>Your payment has been successfully processed. Here are your order details:</p>

              <div class="order-details">
                <div class="detail-row">
                  <span class="label">Order Number:</span>
                  <span class="value">${data.orderNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Product:</span>
                  <span class="value">${productName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Amount:</span>
                  <span class="price">$${data.amount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payment Method:</span>
                  <span class="value">${data.paymentMethod === "paypal" ? "PayPal" : "Bank Transfer"}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Subscription Start:</span>
                  <span class="value">${data.subscriptionStartDate.toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Next Renewal:</span>
                  <span class="value">${data.renewalDate.toLocaleDateString()}</span>
                </div>
              </div>

              <p style="margin-top: 20px; color: #00F7FF;">
                <strong>📅 Auto-Renewal:</strong> Your subscription will automatically renew on ${data.renewalDate.toLocaleDateString()}. 
                You can cancel anytime from your account settings.
              </p>

              <p style="margin-top: 20px;">
                You now have full access to ${productName}. Visit your account to manage your subscription.
              </p>

              <a href="https://prophetdia-jsyacvgb.manus.space/subscriptions" class="button">
                Manage Subscription
              </a>
            </div>

            <div class="footer">
              <p>© 2026 Prophet Dian. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@prophetdian.com",
      to: data.userEmail,
      subject: `Payment Confirmed - ${productName} - Order #${data.orderNumber}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment confirmation email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return false;
  }
}

export interface RefundNotificationData {
  userEmail: string;
  userName: string;
  orderNumber: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export async function sendRefundNotificationEmail(data: RefundNotificationData): Promise<boolean> {
  try {
    const statusColor = data.status === "approved" ? "#00F7FF" : data.status === "rejected" ? "#FA00FF" : "#888888";
    const statusText = data.status === "approved" ? "Approved" : data.status === "rejected" ? "Rejected" : "Pending Review";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Fredoka', Arial, sans-serif; background-color: #000000; color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; border-radius: 8px; border: 2px solid #00F7FF; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #FA00FF; margin: 0; font-size: 28px; }
            .status { text-align: center; padding: 15px; background-color: #000000; border-radius: 5px; margin: 20px 0; border: 2px solid ${statusColor}; }
            .status-text { font-size: 20px; font-weight: bold; color: ${statusColor}; }
            .content { margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333333; color: #888888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Refund Request Update</h1>
            </div>

            <div class="status">
              <div class="status-text">${statusText}</div>
            </div>

            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Your refund request has been reviewed. Here are the details:</p>

              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Refund Amount:</strong> $${data.amount.toFixed(2)}</p>
              <p><strong>Reason:</strong> ${data.reason}</p>
              <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>

              ${data.status === "approved" 
                ? "<p style='color: #00F7FF;'><strong>✓ Your refund has been approved and will be processed within 3-5 business days.</strong></p>" 
                : data.status === "rejected" 
                ? "<p style='color: #FA00FF;'><strong>✗ Your refund request has been rejected. Please contact support for more information.</strong></p>" 
                : "<p style='color: #888888;'><strong>⏳ Your refund request is being reviewed. We'll notify you once a decision is made.</strong></p>"}

              <p>If you have any questions, please contact our support team.</p>
            </div>

            <div class="footer">
              <p>© 2026 Prophet Dian. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@prophetdian.com",
      to: data.userEmail,
      subject: `Refund Request ${statusText} - Order #${data.orderNumber}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Refund notification email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send refund notification email:", error);
    return false;
  }
}
