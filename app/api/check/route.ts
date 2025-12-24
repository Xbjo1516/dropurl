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

        if (!engineResult) {
            return NextResponse.json(
                { error: "engineResult is required" },
                { status: 400 }
            );
        }

        // ✅ ใช้ admin client เท่านั้น
        const supabaseAdmin = getSupabaseAdmin();

        // 1️⃣ หา domain user จาก auth_user_id
        console.log("👤 fetching domain user...");
        const { data: domainUser, error: userErr } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("auth_user_id", auth_user_id)
            .single();

        console.log("👤 domainUser:", domainUser);
        if (userErr || !domainUser) {
            throw new Error("Domain user not found");
        }

        // 2️⃣ create check
        console.log("📝 creating check...");
        const check = await createCheck({
            user_id: domainUser.id,
            source,
            raw_input: rawInput ?? null,
            urls,
        });

        // 3️⃣ save engine result
        console.log("⚙️ saving engine result...");
        await saveEngineResult({
            check_id: check.id,
            has_404: engineResult.has404,
            has_duplicate: engineResult.hasDuplicate,
            has_seo_issues: engineResult.hasSeoIssues,
            raw_result_json: engineResult.raw ?? {},
        });

        // 4️⃣ AI summary
        console.log("🤖 generating AI summary...");
        const aiSummary = await summarizeWithAI({
            urls,
            has404: engineResult.has404,
            hasDuplicate: engineResult.hasDuplicate,
            hasSeoIssues: engineResult.hasSeoIssues,
        });

        // 5️⃣ save AI result
        console.log("💾 saving AI result...");
        await saveAiResult({
            check_id: check.id,
            ai_summary: aiSummary,
        });

        console.log("🎉 /api/check SUCCESS");

        return NextResponse.json({
            success: true,
            check_id: check.id,
            ai_summary: aiSummary,
        });
    } catch (err: any) {
        console.error("🔥 POST /api/check FATAL ERROR:", err);
        return NextResponse.json(
            { error: "Internal server error", message: err?.message },
            { status: 500 }
        );
    }
}
