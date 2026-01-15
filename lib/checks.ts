// /lib/checks.ts
import { getSupabaseAdmin } from "./supabaseAdmin";

/* =======================
   USERS
======================= */
export async function createOrGetUserByDiscord(params: {
    discord_id: string;
    discord_username?: string;
    avatar_url?: string;
}) {
    const supabaseAdmin = getSupabaseAdmin();

    // 1️⃣ หา user ก่อน
    const { data: existing, error: findErr } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("discord_id", params.discord_id)
        .maybeSingle();

    if (findErr) throw findErr;
    if (existing) return existing;

    // 2️⃣ ไม่เจอ → สร้างใหม่ (upsert กัน race condition)
    const { data, error } = await supabaseAdmin
        .from("users")
        .upsert(
            {
                discord_id: params.discord_id,
                discord_username: params.discord_username ?? null,
                avatar_url: params.avatar_url ?? null,
                created_from: "discord",
            },
            { onConflict: "discord_id" }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* =======================
   CHECKS
======================= */
export async function createCheck(params: {
    user_id: number;
    source: "web" | "discord";
    raw_input?: string | null;
    urls: string[];
}) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from("checks")
        .insert({
            user_id: params.user_id,
            source: params.source,
            raw_input: params.raw_input ?? null,
            urls: params.urls,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* =======================
   RESULTS - ENGINE
======================= */
export async function saveEngineResult(params: {
    check_id: number;
    overall_status: string;
    has_404: boolean;
    has_duplicate: boolean;
    has_seo_issues: boolean;
    raw_result_json: any;
    status?: "success" | "error";
}) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from("check_results")
        .insert({
            check_id: params.check_id,
            result_type: "engine",
            status: params.status ?? "success",
            overall_status: params.overall_status,
            has_404: params.has_404,
            has_duplicate: params.has_duplicate,
            has_seo_issues: params.has_seo_issues,
            raw_result_json: params.raw_result_json,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* =======================
   RESULTS - AI
======================= */
export async function saveAiResult(params: {
    check_id: number;
    ai_summary: string;
    raw_result_json?: any;
    status?: "success" | "error";
}) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
        .from("check_results")
        .insert({
            check_id: params.check_id,
            result_type: "ai",
            status: params.status ?? "success",
            ai_summary: params.ai_summary,
            raw_result_json: params.raw_result_json,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
