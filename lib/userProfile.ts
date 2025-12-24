"use client";

import { supabase } from "@/lib/supabaseClient";

export async function syncCurrentUserProfile() {
  console.log("🔄 syncCurrentUserProfile: start");

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    console.warn("❌ no auth user", error);
    return;
  }

  const user = data.user;
  console.log("👤 auth user:", user.id);

  // ===============================
  // 2️⃣ Extract Discord identity
  // ===============================
  const identities: any[] = Array.isArray(user.identities)
    ? user.identities
    : [];

  const discordIdentity = identities.find(
    (i) => i.provider === "discord"
  );

  const identityData = discordIdentity?.identity_data ?? {};

  const discordId =
    identityData.user_id ||
    identityData.sub ||
    discordIdentity?.id ||
    user.user_metadata?.provider_id ||
    user.user_metadata?.sub ||
    null;

  if (!discordId) {
    console.warn("⚠️ syncCurrentUserProfile: no discordId", {
      identities,
      meta: user.user_metadata,
    });
    return;
  }

  const payload = {
    auth_user_id: user.id,
    discord_id: String(discordId),
    discord_username:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      identityData.username ||
      null,
    avatar_url:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      identityData.avatar_url ||
      null,
  };

  console.log("📦 sync payload:", payload);

  // ===============================
  // 3️⃣ Send to server API
  // ===============================
  try {
    const res = await fetch("/api/sync-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ⭐ สำคัญ
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("❌ sync-user API failed:", res.status, result);
      return;
    }

    console.log("✅ sync-user success:", result);
  } catch (err) {
    console.error("🔥 sync-user network error:", err);
  }
}
