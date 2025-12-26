import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
    createCheck,
    saveEngineResult,
    saveAiResult,
} from "@/lib/checks";
import { summarizeWithAI } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    console.log("🚀 /api/check called");

    try {
        const body = await req.json();
        console.log("📦 REQUEST BODY:", body);

        const {
            auth_user_id,
            urls,
            rawInput,
            source = "web",
            engineResult,
        } = body;

        // ===============================
        // 1️⃣ basic validation
        // ===============================
        if (!auth_user_id) {
            return NextResponse.json(
                { error: "auth_user_id missing" },
                { status: 400 }
            );
        }

        if (!Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json(
                { error: "URLs are required" },
                { status: 400 }
            );
        }

        // ❗ บังคับ engineResult เฉพาะ web
        if (source === "web" && !engineResult) {
            return NextResponse.json(
                { error: "engineResult is required for web source" },
                { status: 400 }
            );
        }

        // ===============================
        // 2️⃣ หา domain user
        // ===============================
        const supabaseAdmin = getSupabaseAdmin();

        console.log("👤 fetching domain user...");
        const { data: domainUser, error: userErr } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single();

        if (userErr || !domainUser) {
            throw new Error("Domain user not found");
        }

        // ===============================
        // 3️⃣ create check (ทุก source)
        // ===============================
        console.log("📝 creating check...");
        const check = await createCheck({
            user_id: domainUser.id,
            source,
            raw_input: rawInput ?? null,
            urls,
        });

        // ===============================
        // 4️⃣ WEB → save engine only
        // ===============================
        if (source === "web") {
            console.log("⚙️ saving engine result (web)");

            await saveEngineResult({
                check_id: check.id,
                has_404: engineResult.has404,
                has_duplicate: engineResult.hasDuplicate,
                has_seo_issues: engineResult.hasSeoIssues,
                raw_result_json: engineResult.raw ?? {},
            });
        }

        // ===============================
        // 5️⃣ DISCORD → AI only
        // ===============================
        let aiSummary: string | null = null;

        if (source === "discord") {
            console.log("🤖 generating AI summary (discord)");
            aiSummary = await summarizeWithAI({
                urls,
                has404: false,
                hasDuplicate: false,
                hasSeoIssues: false,
            });
        }

        console.log("🎉 /api/check SUCCESS");

        return NextResponse.json({
            success: true,
            check_id: check.id,
            source,
        });
    } catch (err: any) {
        console.error("🔥 POST /api/check FATAL ERROR:", err);
        return NextResponse.json(
            { error: "Internal server error", message: err?.message },
            { status: 500 }
        );
    }
}
