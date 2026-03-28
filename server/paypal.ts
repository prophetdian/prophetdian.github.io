import axios from "axios";

const PAYPAL_API_BASE = "https://api.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(`${PAYPAL_API_BASE}/v1/oauth2/token`, "grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in;

    // Cache token with 60 second buffer before expiration
    cachedAccessToken = {
      token,
      expiresAt: Date.now() + (expiresIn - 60) * 1000,
    };

    return token;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    throw new Error("Failed to authenticate with PayPal");
  }
}

export interface PayPalOrderData {
  intent: "CAPTURE";
  purchase_units: Array<{
    amount: {
      currency_code: "USD";
      value: string;
    };
    description: string;
  }>;
  payer?: {
    email_address: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
}

export async function createPayPalOrder(
  amount: number,
  description: string,
  userEmail: string,
  userName?: string
): Promise<string> {
  const accessToken = await getPayPalAccessToken();

  const orderData: PayPalOrderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount.toFixed(2),
        },
        description,
      },
    ],
    payer: {
      email_address: userEmail,
      ...(userName && {
        name: {
          given_name: userName.split(" ")[0] || "User",
          surname: userName.split(" ")[1] || "User",
        },
      }),
    },
  };

  try {
    const response = await axios.post(`${PAYPAL_API_BASE}/v2/checkout/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.id;
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    throw new Error("Failed to create payment order");
  }
}

export async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to capture PayPal order:", error);
    throw new Error("Failed to process payment");
  }
}

export async function getPayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.get(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get PayPal order:", error);
    throw new Error("Failed to retrieve payment status");
  }
}
