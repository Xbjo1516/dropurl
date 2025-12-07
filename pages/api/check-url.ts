// /pages/api/check-url.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Checks = {
  all?: boolean;
  check404?: boolean;
  duplicate?: boolean;
  seo?: boolean;
};

type Check404Item = {
  url: string;
  pageStatus: number | null;
  iframe404s: any[];
  assetFailures: any[];
  error?: string;
};

type Check404Result = {
  error: boolean;
  errorMessage?: string;
  results: Check404Item[];
};

// เช็ค 404 แบบเบา ใช้ fetch (รองรับ Vercel)
async function check404Simple(urls: string[]): Promise<Check404Result> {
  const results: Check404Item[] = [];

  for (const raw of urls) {
    const url = String(raw || "").trim();
    let pageStatus: number | null = null;
    let error: string | undefined;

    try {
      let res = await fetch(url, { method: "HEAD" });
      if (!res.ok && res.status === 405) {
        res = await fetch(url, { method: "GET" });
      }
      pageStatus = res.status;
    } catch (e: any) {
      error = e?.message || String(e);
    }

    results.push({
      url,
      pageStatus,
      iframe404s: [],
      assetFailures: [],
      ...(error ? { error } : {}),
    });
  }

  return { error: false, results };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: true, errorMessage: "Method not allowed" });
  }

  const { urls, checks } = req.body as {
    urls?: string[];
    checks?: Checks;
  };

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({
      error: true,
      errorMessage: "urls must be a non-empty array",
    });
  }

  // normalize "all"
  const normalizedChecks = {
    check404: checks?.all || checks?.check404,
    duplicate: checks?.all || checks?.duplicate,
    seo: checks?.all || checks?.seo,
  };

  // normalize URLs
  const normalizedUrls = urls.map((u) => {
    const s = String(u || "").trim();
    if (!s) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `https://${s}`;
  });

  try {
    const result: any = {};

    // 1) 404
    if (normalizedChecks.check404) {
      result.check404 = await check404Simple(normalizedUrls);
    }

    // 2) DUPLICATE — ยังไม่รองรับ Vercel
    if (normalizedChecks.duplicate) {
      result.duplicate = {
        error: true,
        errorMessage:
          "Duplicate scanning is not supported in this environment.",
        results: [],
      };
    }

    // 3) SEO — ยังไม่รองรับ Vercel
    if (normalizedChecks.seo) {
      result.seo = {
        error: true,
        errorMessage:
          "SEO analysis is not supported in this environment.",
        results: [],
      };
    }

    return res.status(200).json({ error: false, result });
  } catch (err: any) {
    console.error("check-url handler error:", err);
    return res.status(500).json({
      error: true,
      errorMessage: "Server error",
      detail: String(err),
    });
  }
}
