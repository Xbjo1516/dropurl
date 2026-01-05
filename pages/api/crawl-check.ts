// pages/api/crawl-check.ts
import type { NextApiRequest, NextApiResponse } from "next";

const DROPURL_WORKER_URL = process.env.DROPURL_WORKER_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, message: "Method not allowed" });
  }

  if (!DROPURL_WORKER_URL) {
    return res.status(500).json({
      error: true,
      message: "WORKER_URL is not configured",
    });
  }

  try {
    // 1️⃣ call worker
    const resp = await fetch(`${DROPURL_WORKER_URL}/crawl-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: true,
        message: "Invalid JSON from worker",
        raw: text,
      });
    }

    if (!resp.ok || data?.error) {
      return res.status(resp.status).json(data);
    }

    // 2️⃣ extract crawl results
    const crawlResults = data?.result?.results ?? [];

    // 3️⃣ derive simple flags
    const has404 = crawlResults.some(
      (item: any) => item.status === 404
    );

    // 4️⃣ pack as engineResult (สำคัญมาก)
    const engineResult = {
      type: "crawl",
      has404,
      hasDuplicate: false,
      hasSeoIssues: false,
      raw: {
        crawlResults,
        crawlMeta: {
          maxDepth: req.body?.maxDepth,
          sameDomainOnly: req.body?.sameDomainOnly,
        },
      },
    };

    // 5️⃣ return to frontend
    return res.status(200).json({
      error: false,
      engineResult,
      crawlResults, // เผื่อ frontend ใช้ render tree / table
    });
  } catch (err: any) {
    console.error("crawl-check proxy failed:", err);
    return res.status(500).json({
      error: true,
      message: err.message || "Proxy to worker failed",
    });
  }
}
