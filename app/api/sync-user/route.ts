import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    console.log("🚀 /api/sync-user called");

    try {
        // ===============================
        // 1️⃣ auth user
        // ===============================
        const supabase = createRouteHandlerClient({ cookies });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("👤 auth user:", user);
        console.log("⚠️ auth error:", authError);

        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ===============================
        // 2️⃣ body
        // ===============================
        const body = await req.json();
        console.log("📦 body:", body);

        const { discord_id, discord_username, avatar_url } = body;

        // ===============================
        // 3️⃣ create admin client
        // ===============================
        console.log("🔑 creating admin client...");
        const supabaseAdmin = getSupabaseAdmin();
        console.log("✅ admin client created");

        // ===============================
        // 4️⃣ upsert
        // ===============================
        console.log("💾 upserting user...");
        const { data, error } = await supabaseAdmin
            .from("users")
            .upsert(
                {
                    auth_user_id: user.id,
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
                details: err,
            },
            { status: 500 }
        );
    }
}
