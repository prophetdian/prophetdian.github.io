import { describe, it, expect } from "vitest";

describe("Supabase Configuration", () => {
  it("should have Supabase environment variables configured", () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });

  it("should have valid Supabase URL format", () => {
    const url = process.env.SUPABASE_URL;
    expect(url).toMatch(/https:\/\/.*\.supabase\.co/);
  });

  it("should have valid Supabase keys format", () => {
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    expect(anonKey).toBeDefined();
    expect(serviceKey).toBeDefined();
    expect(anonKey?.length).toBeGreaterThan(10);
    expect(serviceKey?.length).toBeGreaterThan(10);
  });
});
