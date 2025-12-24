import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("🚀 /api/sync-user called");

  try {
    const body = await req.json();
    console.log("📦 body:", body);

    const {
      auth_user_id,
      discord_id,
      discord_username,
      avatar_url,
    } = body;

    if (!auth_user_id || !discord_id) {
      return NextResponse.json(
        { error: "auth_user_id and discord_id are required" },
        { status: 400 }
      );
    }

    console.log("🔑 creating admin client...");
    const supabaseAdmin = getSupabaseAdmin();

    console.log("💾 upserting user...");
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          auth_user_id,
          discord_id: String(discord_id),
          discord_username: discord_username ?? null,
          avatar_url: avatar_url ?? null,
        },
        { onConflict: "discord_id" }
      )
      .select()
      .single();

    console.log("📊 upsert data:", data);
    console.log("❌ upsert error:", error);

    if (error) throw error;

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error("🔥 sync-user FATAL:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err?.message,
      },
      { status: 500 }
    );
  }
}
