// /pages/api/discord-check.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { summarizeWithAI } from "@/lib/ai";

type Lang = "th" | "en";

interface Body {
  urls: string[];
  discordUserId?: string | null;
  rawInput?: string | null;
  lang?: Lang;
  source?: string;
}

type SuccessResponse = {
  ok: true;
  summary: string;
};

type ErrorResponse = {
  ok: false;
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      urls,
      discordUserId,
      rawInput,
      lang = "th",
      source = "discord",
    } = req.body as Body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res
        .status(400)
        .json({ ok: false, error: "urls is required (array)" });
    }

    // หา user โดย discord_id ถ้ามีส่งมา
    let userId: string | null = null;
    if (discordUserId) {
      const { data: userRow, error: userErr } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("discord_id", discordUserId)
        .maybeSingle();

      if (userErr) {
        console.error("find user by discord_id error:", userErr);
      }
      userId = userRow?.id ?? null;
    }

    // TODO: ต่อกับผล 404 / DUP / SEO จริงภายหลัง
    const has404 = false;
    const hasDuplicate = false;
    const hasSeoIssues = false;

    // สรุปด้วย AI
    const summary = await summarizeWithAI(
      { urls, has404, hasDuplicate, hasSeoIssues },
      lang
    );

    // บันทึกลง checks (ถ้ามีตารางนี้อยู่แล้ว)
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

    return res.status(200).json({ ok: true, summary });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}
