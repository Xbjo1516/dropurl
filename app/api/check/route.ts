import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
    createCheck,
    saveEngineResult,
    saveAiResult,
} from "@/lib/checks";
import { summarizeWithAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        // ✅ สร้างตอน runtime เท่านั้น (แก้ build error)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase env vars are missing");
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            global: {
                headers: {
                    Cookie: cookies().toString(),
                },
            },
        });

        const body = await req.json();
        const { urls, rawInput, source = "web", engineResult } = body;

        if (!urls?.length) {
            return NextResponse.json({ error: "URLs are required" }, { status: 400 });
        }

        if (!engineResult) {
            return NextResponse.json(
                { error: "engineResult is required" },
                { status: 400 }
            );
        }

        // 1️⃣ auth user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        // 2️⃣ domain user
        const { data: domainUser, error: userErr } = await supabase
            .from("users")
            .select("id")
            .eq("auth_user_id", user.id)
            .single();

        if (userErr || !domainUser) {
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 400 }
            );
        }

        // 3️⃣ create check
        const check = await createCheck({
            user_id: domainUser.id,
            source,
            raw_input: rawInput ?? null,
            urls,
        });

        // 4️⃣ engine result
        await saveEngineResult({
            check_id: check.id,
            has_404: engineResult.has404,
            has_duplicate: engineResult.hasDuplicate,
            has_seo_issue: engineResult.hasSeoIssues,
            raw_result_json: engineResult.raw,
        });

        // 5️⃣ AI
        const aiSummary = await summarizeWithAI({
            urls,
            has404: engineResult.has404,
            hasDuplicate: engineResult.hasDuplicate,
            hasSeoIssues: engineResult.hasSeoIssues,
        });

        await saveAiResult({
            check_id: check.id,
            ai_summary: aiSummary,
        });

        return NextResponse.json({
            success: true,
            check_id: check.id,
            ai_summary: aiSummary,
        });
    } catch (err) {
        console.error("POST /api/check error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
