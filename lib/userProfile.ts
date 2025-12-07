// /lib/userProfile.ts
"use client";

import { getSupabaseClient } from "@/lib/supabaseClient";

const supabase = getSupabaseClient();


export async function syncCurrentUserProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    console.warn("syncCurrentUserProfile: no auth user", error);
    return;
  }

  const user = data.user;

  const identities: any[] = (user.identities as any[]) ?? [];
  const discordIdentity = identities.find((i) => i.provider === "discord");
  const identityData = discordIdentity?.identity_data ?? {};

  const discordId =
    identityData.user_id ||
    identityData.sub ||
    discordIdentity?.id ||
    user.user_metadata?.provider_id ||
    user.user_metadata?.sub ||
    null;

  const username =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    identityData.username ||
    null;

  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    identityData.avatar_url ||
    null;

  if (!discordId) {
    console.warn("syncCurrentUserProfile: no discordId found", {
      identities,
      meta: user.user_metadata,
    });
    return;
  }

  const payload = {
    auth_user_id: user.id,
    discord_id: String(discordId),
    discord_username: username,
    avatar_url: avatarUrl,
  };

  console.log("syncCurrentUserProfile payload:", payload);

  const { error: upsertError } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "discord_id" });

  if (upsertError) {
    console.error("syncCurrentUserProfile failed:", {
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
      code: upsertError.code,
    });
  }
}
