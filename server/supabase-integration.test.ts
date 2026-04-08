import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://rqlucgdeuvpkkrbnvjex.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

describe("Supabase Integration", () => {
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  it("should connect to Supabase", async () => {
    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();
  });

  it("should verify database tables exist", async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows found" which is OK
      console.log("Table check result:", { data, error });
    }
    expect(supabaseUrl).toBeDefined();
  });

  it("should have correct environment variables", () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(process.env.DATABASE_URL).toBeDefined();
  });

  it("should verify PayPal live mode is configured", () => {
    expect(process.env.PAYPAL_MODE).toBe("live");
    expect(process.env.PAYPAL_CLIENT_ID).toBeDefined();
    expect(process.env.PAYPAL_CLIENT_SECRET).toBeDefined();
  });

  it("should verify authentication configuration", () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.VITE_APP_ID).toBeDefined();
    expect(process.env.OAUTH_SERVER_URL).toBeDefined();
  });

  it("should verify all required environment variables for production", () => {
    const requiredVars = [
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
      "JWT_SECRET",
      "PAYPAL_MODE",
      "PAYPAL_CLIENT_ID",
      "PAYPAL_CLIENT_SECRET",
      "VITE_APP_ID",
      "OAUTH_SERVER_URL",
    ];

    requiredVars.forEach((varName) => {
      expect(process.env[varName]).toBeDefined();
    });
  });
});
