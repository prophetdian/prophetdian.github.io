import { describe, it, expect } from "vitest";

describe("PayPal Integration", () => {
  it("should validate PayPal credentials", async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE;

    expect(clientId).toBeDefined();
    expect(clientSecret).toBeDefined();
    expect(mode).toBe("live");

    // Test PayPal OAuth token endpoint
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    try {
      const response = await fetch("https://api.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.access_token).toBeDefined();
      expect(data.token_type).toBe("Bearer");
    } catch (error) {
      throw new Error(`PayPal credentials validation failed: ${error}`);
    }
  });
});
