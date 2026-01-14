import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendDiscordMessage } from "@/lib/discord";

export async function notifyCheckCompleted(check_id: number) {
    console.log("🔔 notifyCheckCompleted called:", check_id);

    const supabase = getSupabaseAdmin();

    const { data: check, error: checkError } = await supabase
        .from("checks")
        .select("id, source, urls")
        .eq("id", check_id)
        .single();

    if (checkError || !check) {
        console.error("[notifyCheckCompleted] check not found", checkError);
        return;
    }

    const { data: results } = await supabase
        .from("check_results")
        .select("has_404, has_seo_issue, has_duplicate")
        .eq("check_id", check_id);

    if (!results || results.length === 0) {
        console.warn("[notifyCheckCompleted] no results yet");
        return;
    }

    const summary = {
        has_404: results.some(r => r.has_404),
        has_seo_issue: results.some(r => r.has_seo_issue),
        has_duplicate: results.some(r => r.has_duplicate),
    };

    const overallStatus =
        summary.has_404
            ? "🔴 Critical – 404 issues found"
            : summary.has_seo_issue
                ? "🟡 Needs Attention – SEO issues"
                : summary.has_duplicate
                    ? "🟠 Minor Issues – Duplicate detected"
                    : "🟢 Healthy – No major issues";

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
