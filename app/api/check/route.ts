import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
    createCheck,
    saveEngineResult,
    saveAiResult,
} from "@/lib/checks";
import { summarizeWithAI } from "@/lib/ai";
import { notifyCheckCompleted } from "@/lib/notifyDiscord";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    console.log("🚀 /api/check called");

    try {
        const body = await req.json();
        console.log("📦 REQUEST BODY:", body);

        const {
            auth_user_id,
            discord_id,
            urls,
            rawInput,
            source = "web",
            engineResult,
            checks,
        } = body;

        // ===============================
        // 1️⃣ validation
        // ===============================
        if (source === "web" && !auth_user_id) {
            return NextResponse.json(
                { error: "auth_user_id missing (web)" },
                { status: 400 }
            );
        }

        if (source === "discord" && !discord_id) {
            return NextResponse.json(
                { error: "discord_id missing" },
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

        // ===============================
        // 2️⃣ หา user
        // ===============================
        const supabaseAdmin = getSupabaseAdmin();

        let domainUser;
        let userErr;

        if (source === "web") {
            // 🔵 WEB → ใช้ auth_user_id (Supabase Auth)
            const res = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("auth_user_id", auth_user_id)
                .single();

            domainUser = res.data;
            userErr = res.error;
        }

        if (source === "discord") {
            // 🟣 DISCORD → ใช้ discord_id
            const res = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("discord_id", discord_id)
                .single();

            domainUser = res.data;
            userErr = res.error;
        }

        if (userErr || !domainUser) {
            throw new Error(`Domain user not found for source=${source}`);
        }

        // ===============================
        // 3️⃣ create checks
        // ===============================
        const check = await createCheck({
            user_id: domainUser.id,
            source,              // web | discord
            raw_input: rawInput ?? null,
            urls,
        });

        // ===============================
        // 4️⃣ save ENGINE result
        // ===============================
        if (source === "web") {
            await saveEngineResult({
                check_id: check.id,
                has_404: engineResult.has404,
                has_duplicate: engineResult.hasDuplicate,
                has_seo_issues: engineResult.hasSeoIssues,
                raw_result_json: engineResult.raw ?? {},
            });
        }

        // ===============================
        // 5️⃣ generate + save AI result
        // ===============================
        if (source === "discord") {
            const aiSummary = await summarizeWithAI({
                urls,
                has404: engineResult.has404,
                hasDuplicate: engineResult.hasDuplicate,
                hasSeoIssues: engineResult.hasSeoIssues,
            });

            const aiRawResult = {
                source,
                result_type: "ai",
                urls,
                flags: {
                    has404: engineResult.has404,
                    hasDuplicate: engineResult.hasDuplicate,
                    hasSeoIssues: engineResult.hasSeoIssues,
                },
                engine_snapshot: engineResult.raw ?? {},
            };

            await saveAiResult({
                check_id: check.id,
                ai_summary: aiSummary,
                raw_result_json: aiRawResult,
            });
        }

        console.log("🎉 /api/check SUCCESS");

        // ===============================
        // 🔔 6️⃣ notify discord (AFTER everything saved)
        // ===============================
        try {
            await notifyCheckCompleted(check.id);
        } catch (e) {
            console.error("Discord notify failed", e);
        }

        return NextResponse.json({
            success: true,
            check_id: check.id,
            source,
        });
    } catch (err: any) {
        console.error("🔥 POST /api/check ERROR:", err);
        return NextResponse.json(
            { error: "Internal server error", message: err?.message },
            { status: 500 }
        );
    }
}
