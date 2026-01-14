import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendDiscordMessage } from "@/lib/discord";

export async function notifyCheckStarted(check_id: number) {
    console.log("🚀 notifyCheckStarted called:", check_id);

    const supabase = getSupabaseAdmin();

    const { data: check, error } = await supabase
        .from("checks")
        .select("id, source, urls")
        .eq("id", check_id)
        .single();

    if (error || !check) {
        console.error("[notifyCheckStarted] check not found", error);
        return;
    }

    try {
        await sendDiscordMessage({
            title: "🚀 DropURL – Check Started",
            description: check.source === "web" ? "🌐 From Web" : "🤖 From Discord",
            fields: [
                {
                    name: "🔗 URLs",
                    value: String(check.urls).slice(0, 700),
                },
            ],
        });
    } catch (err) {
        console.error("[notifyCheckStarted] discord send failed", err);
    }
}
