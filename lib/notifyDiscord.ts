import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendDiscordMessage } from "@/lib/discord";

export async function notifyCheckCompleted(check_id: number) {
    console.log("🔔 notifyCheckCompleted called:", check_id);

    const supabase = getSupabaseAdmin();

    // ===============================
    // 1️⃣ Fetch check
    // ===============================
    const { data: check, error: checkError } = await supabase
        .from("checks")
        .select("id, source, urls")
        .eq("id", check_id)
        .single();

    if (checkError || !check) {
        console.error("[notifyCheckCompleted] check not found", checkError);
        return;
    }

    // ===============================
    // 2️⃣ Fetch results (ใช้ schema จริง)
    // ===============================
    const { data: results, error: resultError } = await supabase
        .from("check_results")
        .select("has_404, has_seo_issues, has_duplicate")
        .eq("check_id", check_id);

    if (resultError) {
        console.error("[notifyCheckCompleted] failed to fetch results", resultError);
        return;
    }

    if (!results || results.length === 0) {
        console.warn("[notifyCheckCompleted] no results yet");
        return;
    }

    // ===============================
    // 3️⃣ Summarize results
    // ===============================
    const summary = {
        has_404: results.some(r => r.has_404),
        has_seo_issues: results.some(r => r.has_seo_issues),
        has_duplicate: results.some(r => r.has_duplicate),
    };

    // ===============================
    // 4️⃣ Overall status
    // ===============================
    const overallStatus =
        summary.has_404
            ? "🔴 Critical – 404 issues found"
            : summary.has_duplicate
                ? "🟠 Minor Issues – Duplicate detected"
                : summary.has_seo_issues
                    ? "🟡 Needs Attention – SEO issues"
                    : "🟢 Healthy – No major issues";

    // ===============================
    // 5️⃣ Send Discord notification
    // ===============================
    try {
        await sendDiscordMessage({
            title: "✅ DropURL – Check Completed",
            description: check.source === "web" ? "🌐 From Web" : "🤖 From Discord",
            fields: [
                {
                    name: "🔗 URLs",
                    value: String(check.urls).slice(0, 700),
                },
                {
                    name: "🧭 Overall Status",
                    value: overallStatus,
                },
            ],
        });
    } catch (err) {
        console.error("[notifyCheckCompleted] discord send failed", err);
    }
}
