import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// บังคับ dynamic เพื่อให้ cookie ทำงานบน Vercel
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    console.log("🚀 /api/sync-user called");

    try {
        // ===============================
        // 1️⃣ supabase (อ่าน auth จาก cookie)
        // ===============================
        const supabase = createRouteHandlerClient({ cookies });

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("👤 auth user:", user);
        console.log("⚠️ auth error:", authError);

        if (!user || authError) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ===============================
        // 2️⃣ body
        // ===============================
        const body = await req.json();
        console.log("📦 payload:", body);

        const {
            discord_id,
            discord_username,
            avatar_url,
        } = body;

        if (!discord_id) {
            return NextResponse.json(
                { error: "discord_id is required" },
                { status: 400 }
            );
        }

        // ===============================
        // 3️⃣ upsert user (admin)
        // ===============================
        const supabaseAdmin = getSupabaseAdmin();

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

        console.log("✅ upsert result:", data);
        console.log("⚠️ upsert error:", error);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            user: data,
        });
    } catch (err) {
        console.error("🔥 /api/sync-user error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
