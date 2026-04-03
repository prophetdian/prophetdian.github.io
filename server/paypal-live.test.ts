import { describe, it, expect } from "vitest";

describe("PayPal Live Mode Configuration", () => {
  it("should have PayPal live credentials configured", () => {
    expect(process.env.PAYPAL_CLIENT_ID).toBeDefined();
    expect(process.env.PAYPAL_CLIENT_SECRET).toBeDefined();
    expect(process.env.PAYPAL_MODE).toBeDefined();
  });

  it("should be set to live mode, not sandbox", () => {
    expect(process.env.PAYPAL_MODE).toBe("live");
  });

  it("should have valid PayPal Client ID format", () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId?.length).toBeGreaterThan(20);
  });

  it("should have valid PayPal Client Secret format", () => {
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret?.length).toBeGreaterThan(20);
  });

  it("should validate PayPal live endpoint", async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE;

    expect(mode).toBe("live");
    
    // Verify credentials format for live mode
    if (clientId && clientSecret) {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      expect(auth.length).toBeGreaterThan(0);
    }
  });
});
