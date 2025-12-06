// ตัวอย่างโค้ดใน API route ที่บอทจะเรียก
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { summarizeWithAI } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      urls,
      discordUserId,
      rawInput,
      lang = "th",
      source = "discord",
    } = body;

    const { data: userRow, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("discord_id", discordUserId)
      .maybeSingle();

    if (userErr) {
      console.error("find user by discord_id error:", userErr);
    }

    const userId = userRow?.id ?? null;
    const has404 = false; 
    const hasDuplicate = false;
    const hasSeoIssues = false;

    const summary = await summarizeWithAI(
      { urls, has404, hasDuplicate, hasSeoIssues },
      lang
    );

    const { error: insertErr } = await supabaseAdmin.from("checks").insert({
      user_id: userId,
      source,
      raw_input: rawInput,
      urls,
      has_404: has404,
      has_duplicate: hasDuplicate,
      has_seo_issues: hasSeoIssues,
    });

    if (insertErr) {
      console.error("insert check failed:", insertErr);
    }

    return new Response(
      JSON.stringify({ ok: true, summary }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
