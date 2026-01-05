import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      auth_user_id,
      discord_id,
      discord_username,
      avatar_url,
      created_from = "web",
    } = body;

    if (!auth_user_id && !discord_id) {
      return NextResponse.json(
        { error: "auth_user_id or discord_id is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    let user = null;

    // 1️⃣ หา user จาก discord_id ก่อน
    if (discord_id) {
      const { data } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("discord_id", String(discord_id))
        .maybeSingle();

      user = data;
    }

    // 2️⃣ ถ้ายังไม่เจอ → หาจาก auth_user_id
    if (!user && auth_user_id) {
      const { data } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("auth_user_id", auth_user_id)
        .maybeSingle();

      user = data;
    }

    // 3️⃣ ถ้ามี user → UPDATE
    if (user) {
      const { data, error } = await supabaseAdmin
        .from("users")
        .update({
          auth_user_id: auth_user_id ?? user.auth_user_id,
          discord_id: discord_id ? String(discord_id) : user.discord_id,
          discord_username: discord_username ?? user.discord_username,
          avatar_url: avatar_url ?? user.avatar_url,
          created_from,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, user: data });
    }

    // 4️⃣ ไม่มี user → INSERT ใหม่
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id: auth_user_id ?? null,
        discord_id: discord_id ? String(discord_id) : null,
        discord_username: discord_username ?? null,
        avatar_url: avatar_url ?? null,
        created_from,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error("sync-user error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err?.message },
      { status: 500 }
    );
  }
}
