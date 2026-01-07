import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({
      ok: false,
      reason: "invalid_input",
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // ✅ ยิงถึงแล้ว = ok (ไม่สน status)
    return res.status(200).json({
      ok: true,
      status: response.status,
    });
  } catch (err: any) {
    return res.status(200).json({
      ok: false,
      reason: "unreachable",
      message: err?.message,
    });
  }
}
