import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error("Missing Supabase credentials: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    supabaseClient = createClient(url, key);
  }

  return supabaseClient;
}

export async function initializeSupabase() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from("users").select("count").limit(1);

    if (error) {
      console.error("[Supabase] Connection test failed:", error);
      return false;
    }

    console.log("[Supabase] Connected successfully");
    return true;
  } catch (error) {
    console.error("[Supabase] Initialization error:", error);
    return false;
  }
}
