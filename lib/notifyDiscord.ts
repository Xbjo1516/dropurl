import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendDiscordMessage } from "@/lib/discord";

export async function notifyCheckCompleted(check_id: number) {
    const supabase = getSupabaseAdmin();

    // ===============================
    // 🔍 Fetch check
    // ===============================
    const { data: check, error: checkError } = await supabase
        .from("checks")
        .select("id, source, urls, user_id")
        .eq("id", check_id)
        .single();

    if (checkError || !check) {
        console.error("[notifyCheckCompleted] check not found", checkError);
        return;
    }

    // ===============================
    // 📊 Fetch result
    // ===============================
    const { data: result, error: resultError } = await supabase
        .from("check_results")
        .select("has_404, has_seo_issue, has_duplicate")
        .eq("check_id", check_id)
        .single();

    if (resultError || !result) {
        console.error("[notifyCheckCompleted] result not found", resultError);
        return;
    }

    // ===============================
    // 👤 Fetch user
    // ===============================
    const { data: user } = await supabase
        .from("users")
        .select("discord_username")
        .eq("id", check.user_id)
        .single();

    // ===============================
    // 🧭 Overall status (priority-based)
    // ===============================
    const overallStatus = (() => {
        if (result.has_404) {
            return "🔴 Critical – 404 issues found";
        }
        if (result.has_seo_issue) {
            return "🟡 Needs Attention – SEO issues";
        }
        if (result.has_duplicate) {
            return "🟠 Minor Issues – Duplicate detected";
        }
        return "🟢 Healthy – No major issues";
    })();

    // ===============================
    // 🌐 Source label
    // ===============================
    const sourceLabel =
        check.source === "web"
            ? "🌐 From Web"
            : "🤖 From Discord";

    // ===============================
    // 📤 Send Discord notification
    // ===============================
    try {
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
                    value: String(check.urls).slice(0, 700),
                },
                {
                    name: "🧭 Overall Status",
                    value: overallStatus,
                },
            ],
        });
    } catch (err) {
        console.error("[notifyCheckCompleted] failed to send discord message", err);
    }
}