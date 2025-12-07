"use client";

import { getSupabaseClient } from "@/lib/supabaseClient";

const supabase = getSupabaseClient();


export function DiscordLoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/`, // กลับมาหน้าหลักหลังล็อกอิน
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="btn btn-sm btn-outline"
    >
      Login with Discord
    </button>
  );
}
