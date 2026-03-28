import axios from "axios";

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === "sandbox" 
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID!,
          password: PAYPAL_CLIENT_SECRET!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
    return accessToken;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
}

export async function createPayPalOrder(
  amount: number,
  currency: string = "USD",
  description: string = "Prophet Dian Subscription"
) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
            },
            description: description,
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              return_url: `${process.env.FRONTEND_URL}/checkout/success`,
              cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
}

export async function capturePayPalOrder(orderId: string) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    throw error;
  }
}

export async function getPayPalOrderDetails(orderId: string) {
  try {
    const token = await getAccessToken();

    const response = await axios.get(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting PayPal order details:", error);
    throw error;
  }
}

export async function refundPayPalCapture(captureId: string, amount?: number) {
  try {
    const token = await getAccessToken();

    const refundData: any = {};
    if (amount) {
      refundData.amount = {
        currency_code: "USD",
        value: amount.toString(),
      };
    }

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
      refundData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error refunding PayPal capture:", error);
    throw error;
  }
}

export function verifyPayPalWebhookSignature(
  webhookId: string,
  eventBody: string,
  certUrl: string,
  transmissionId: string,
  transmissionTime: string,
  transmissionSig: string
): boolean {
  // In production, verify the webhook signature using PayPal's verification service
  // For now, return true (implement full verification in production)
  return true;
}
