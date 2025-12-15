// pages/api/crawl-check.ts
import type { NextApiRequest, NextApiResponse } from "next";

const WORKER_URL = process.env.WORKER_URL; 
// เช่น https://dropurl-worker-production.up.railway.app

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, message: "Method not allowed" });
  }

  if (!WORKER_URL) {
    return res.status(500).json({
      error: true,
      message: "WORKER_URL is not configured",
    });
  }

  try {
    const workerRes = await fetch(`${WORKER_URL}/crawl-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await workerRes.text();

    // ป้องกัน JSON แตก
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: true,
        message: "Invalid JSON from worker",
        raw: text,
      });
    }

    return res.status(workerRes.status).json(data);
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      message: err.message || "crawl-check proxy failed",
    });
  }
}
