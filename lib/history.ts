// /lib/history.ts
import { supabase } from "./supabaseClient";

type CheckMeta = {
  has404: boolean;
  hasDuplicate: boolean;
  hasSeoIssues: boolean;
};

type CheckResultPayload = {
  urls: string[];
  source: "discord" | "web";
  rawInput?: string;
  discordUserId?: string | null;
  rawResult: any;     
  aiSummary?: string;  
  meta: CheckMeta;
};

export async function ensureUser(discordUserId?: string | null): Promise<number | null> {
  if (!discordUserId) return null;

  const { data: existing, error: findErr } = await supabase
    .from("users")
    .select("id")
    .eq("discord_id", discordUserId)
    .maybeSingle();

  if (findErr) {
    console.error("find user error:", findErr);
  }

  if (existing) return existing.id;

  const { data: inserted, error: insertErr } = await supabase
    .from("users")
    .insert({ discord_id: discordUserId })
    .select("id")
    .single();

  if (insertErr) {
    console.error("insert user error:", insertErr);
    return null;
  }

  return inserted.id;
}

export async function saveCheckHistory(payload: CheckResultPayload) {
  const { urls, source, rawInput, discordUserId, rawResult, aiSummary, meta } = payload;

  const userId = await ensureUser(discordUserId);

  const { data: checkRow, error: checkErr } = await supabase
    .from("checks")
    .insert({
      user_id: userId,
      source,
      raw_input: rawInput ?? null,
      urls,
    })
    .select("id")
    .single();

  if (checkErr) {
    console.error("insert check error:", checkErr);
    return;
  }

  const checkId = checkRow.id;

  const { error: resultErr } = await supabase.from("check_results").insert({
    check_id: checkId,
    has_404: meta.has404,
    has_duplicate: meta.hasDuplicate,
    has_seo_issues: meta.hasSeoIssues,
    raw_result_json: rawResult,
    ai_summary: aiSummary ?? null,
  });

  if (resultErr) {
    console.error("insert check_results error:", resultErr);
  }
}
