import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import {
    createCheck,
    saveEngineResult,
    saveAiResult,
} from "@/lib/checks";
import { summarizeWithAI } from "@/lib/ai";

// 🔥 บังคับให้ route นี้เป็น dynamic (จำเป็นมากบน Vercel)
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    console.log("🚀 /api/check called");

    try {
        // ===============================
        // 1️⃣ สร้าง Supabase client (อ่าน cookie อัตโนมัติ)
        // ===============================
        const supabase = createRouteHandlerClient({ cookies });
        console.log("✅ Supabase client created");

        // ===============================
        // 2️⃣ อ่าน session (debug สำคัญมาก)
        // ===============================
        const sessionRes = await supabase.auth.getSession();
        console.log("🔍 SESSION:", sessionRes.data.session);

        // ===============================
        // 3️⃣ อ่าน user
        // ===============================
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("👤 AUTH USER:", user);
        console.log("⚠️ AUTH ERROR:", authError);

        if (authError || !user) {
            console.error("❌ User not authenticated");
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        // ===============================
        // 4️⃣ อ่าน body
        // ===============================
        const body = await req.json();
        console.log("📦 REQUEST BODY:", body);

        const { urls, rawInput, source = "web", engineResult } = body;

        if (!Array.isArray(urls) || urls.length === 0) {
            console.error("❌ URLs missing");
            return NextResponse.json({ error: "URLs are required" }, { status: 400 });
        }

        if (!engineResult) {
            console.error("❌ engineResult missing");
            return NextResponse.json(
                { error: "engineResult is required" },
                { status: 400 }
            );
        }

        // ===============================
        // 5️⃣ หา domain user
        // ===============================
        const { data: domainUser, error: userErr } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", user.id)
            .single();

        console.log("🧩 DOMAIN USER:", domainUser);
        console.log("⚠️ DOMAIN USER ERROR:", userErr);

        if (userErr || !domainUser) {
            console.error("❌ User profile not found");
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 400 }
            );
        }

        // ===============================
        // 6️⃣ create check
        // ===============================
        console.log("📝 Creating check...");
        const check = await createCheck({
            user_id: domainUser.id,
            source,
            raw_input: rawInput ?? null,
            urls,
        });

        console.log("✅ CHECK CREATED:", check);

        // ===============================
        // 7️⃣ save engine result
        // ===============================
        console.log("⚙️ Saving engine result...");
        const engineSaved = await saveEngineResult({
            check_id: check.id,
            has_404: engineResult.has404,
            has_duplicate: engineResult.hasDuplicate,
            has_seo_issue: engineResult.hasSeoIssues,
            raw_result_json: engineResult.raw ?? {},
        });

        console.log("✅ ENGINE RESULT SAVED:", engineSaved);

        // ===============================
        // 8️⃣ AI summary
        // ===============================
        console.log("🤖 Generating AI summary...");
        const aiSummary = await summarizeWithAI({
            urls,
            has404: engineResult.has404,
            hasDuplicate: engineResult.hasDuplicate,
            hasSeoIssues: engineResult.hasSeoIssues,
        });

        console.log("🧠 AI SUMMARY:", aiSummary);

        // ===============================
        // 9️⃣ save AI result
        // ===============================
        console.log("💾 Saving AI result...");
        const aiSaved = await saveAiResult({
            check_id: check.id,
            ai_summary: aiSummary,
        });

        console.log("✅ AI RESULT SAVED:", aiSaved);

        // ===============================
        // 🔚 response
        // ===============================
        console.log("🎉 /api/check SUCCESS");

        return NextResponse.json({
            success: true,
            check_id: check.id,
            ai_summary: aiSummary,
        });
    } catch (err) {
        console.error("🔥 POST /api/check FATAL ERROR:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
