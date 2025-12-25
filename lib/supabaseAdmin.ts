// /lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  /**
   * ❗ สำคัญมาก
   * ห้าม throw ตอน build phase
   * ให้ throw ตอน runtime เท่านั้น
   */
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase admin env vars", {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
    });

    throw new Error("Supabase admin client is not configured");
  }

  _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdmin;
}
