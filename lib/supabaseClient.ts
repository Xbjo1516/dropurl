// /lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // log ไว้ให้ดูใน log ของ Vercel ด้วย
    console.error("Missing Supabase env vars", {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      HAS_ANON_KEY: !!supabaseAnonKey,
    });
    throw new Error("Missing Supabase env vars");
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}
