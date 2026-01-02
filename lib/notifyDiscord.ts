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
    .select("email")
    .eq("id", check.user_id)
    .single();

  await sendDiscordMessage({
    title: "✅ DropURL – Check Completed",
    description: `Source: **${check.source}**`,
    fields: [
      {
        name: "👤 User",
        value: user?.email || "Unknown",
      },
      {
        name: "🔗 URLs",
        value: check.urls,
      },
      {
        name: "📊 Results",
        value: `
404: ${result?.has_404 ? "❌ Found" : "✅ OK"}
Duplicate: ${result?.has_duplicate ? "⚠️ Found" : "✅ OK"}
SEO: ${result?.has_seo_issue ? "⚠️ Issues" : "✅ OK"}
        `,
      },
      {
        name: "🧠 AI Summary",
        value: result?.ai_summary || "-",
      },
    ],
  });
}
