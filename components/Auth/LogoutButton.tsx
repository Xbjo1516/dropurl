// /components/Auth/LogoutButton.tsx
"use client";

import { supabase } from "@/lib/supabaseClient";

export function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn btn-sm btn-ghost"
    >
      Logout
    </button>
  );
}
