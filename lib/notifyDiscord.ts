import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendDiscordMessage } from "@/lib/discord";

export async function notifyCheckCompleted(check_id: number) {
    const supabase = getSupabaseAdmin();

    const { data: check } = await supabase
        .from("checks")
        .select("id, source, urls, user_id")
        .eq("id", check_id)
        .single();

    if (!check) return;

    const { data: result } = await supabase
        .from("check_results")
        .select("*")
        .eq("check_id", check_id)
        .single();

    const { data: user } = await supabase
        .from("users")
        .select("discord_username")
        .eq("id", check.user_id)
        .single();

    // ===============================
    // 🧭 Overall status (สำคัญมาก)
    // ===============================
    const overallStatus =
        result?.has_404
            ? "🔴 Critical – 404 issues found"
            : result?.has_seo_issue
                ? "🟡 Needs Attention – SEO issues"
                : result?.has_duplicate
                    ? "🟠 Minor Issues – Duplicate detected"
                    : "🟢 Healthy – No major issues";

    // ===============================
    // 🌐 Source label (friendly)
    // ===============================
    const sourceLabel =
        check.source === "web" ? "🌐 From Web" : "🤖 From Discord";

    await sendDiscordMessage({
        title: "✅ DropURL – Check Completed",
        description: sourceLabel,
        fields: [
            {
                name: "👤 User",
                value: user?.discord_username
                    ? `@${user.discord_username}`
                    : "Unknown user",
            },
            {
                name: "🔗 URLs",
                value: String(check.urls).slice(0, 900),
            },
            {
                name: "🧭 Overall Status",
                value: overallStatus,
            },
            {
                name: "📊 Results",
                value: `
404: ${result?.has_404 ? "❌ Found" : "✅ OK"}
SEO: ${result?.has_seo_issue ? "⚠️ Issues" : "✅ OK"}
Duplicate: ${result?.has_duplicate ? "⚠️ Found" : "✅ OK"}
        `.slice(0, 900),
            },
        ],
    });
}
