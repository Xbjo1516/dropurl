// pages/api/crawl-check.ts
import type { NextApiRequest, NextApiResponse } from "next";

const DROPURL_WORKER_URL = process.env.DROPURL_WORKER_URL; 
// เช่น https://dropurl-worker-production.up.railway.app

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
    const resp = await fetch(`${DROPURL_WORKER_URL}/crawl-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await resp.text(); // 👈 ป้องกัน JSON พัง
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

    return res.status(resp.status).json(data);
  } catch (err: any) {
    console.error("crawl-check proxy failed:", err);
    return res.status(500).json({
      error: true,
      message: err.message || "Proxy to worker failed",
    });
  }
}
