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

// ---------- 404 แบบเบา ใช้ fetch ตรง (fallback เวลาไม่มี WORKER_URL) ----------
async function check404Simple(urls: string[]): Promise<Check404Result> {
  const results: Check404Item[] = [];

  for (const raw of urls) {
    const url = String(raw || "").trim();
    let pageStatus: number | null = null;
    let error: string | undefined;

    try {
      let res = await fetch(url, { method: "HEAD" });

      // ถ้าเว็บไม่รองรับ HEAD → ลอง GET แทน
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

// ---------- main handler ----------
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

  // normalize URLs (เติม https:// ถ้ายังไม่มี)
  const normalizedUrls = urls.map((u) => {
    const s = String(u || "").trim();
    if (!s) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `https://${s}`;
  });

  // normalize checks (all = true → เปิดทุกเทส)
  const normalizedChecks: Checks = {
    all: checks?.all,
    check404: checks?.all || checks?.check404,
    duplicate: checks?.all || checks?.duplicate,
    seo: checks?.all || checks?.seo,
  };

  const WORKER_URL = process.env.DROPURL_WORKER_URL;

  // ---------- โหมด 1: ถ้ามี WORKER_URL → ใช้ Railway worker ----------
  if (WORKER_URL) {
    try {
      console.log("WORKER_URL =", WORKER_URL);
      const upstream = await fetch(`${WORKER_URL}/run-checks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: normalizedUrls,
          checks: normalizedChecks,
        }),
      });

      const status = upstream.status;

      if (!upstream.ok) {
        let body: any = null;
        try {
          body = await upstream.json();
        } catch {
          /* ignore */
        }

        // ส่ง status เดิมของ worker กลับไปเลย จะได้ไม่งงว่าเป็น 502 ทั้งหมด
        return res.status(status || 502).json({
          error: true,
          errorMessage:
            body?.errorMessage ||
            `Worker responded with status ${status}`,
          workerStatus: status,
          workerBody: body ?? null,
        });
      }

      const data = await upstream.json();
      // worker ส่ง { error, result } → ส่งต่อให้ frontend
      return res.status(200).json(data);
    } catch (err: any) {
      console.error("check-url proxy error:", err);
      return res.status(500).json({
        error: true,
        errorMessage: "Failed to contact worker.",
        detail: String(err),
      });
    }
  }

  // ---------- โหมด 2: ถ้าไม่มี WORKER_URL → fallback 404 เบา ๆ ----------
  try {
    const result: any = {};

    // 1) 404
    if (normalizedChecks.check404) {
      result.check404 = await check404Simple(normalizedUrls);
    }

    // 2) DUPLICATE (ยังไม่รองรับใน fallback)
    if (normalizedChecks.duplicate) {
      result.duplicate = {
        error: true,
        errorMessage:
          "Duplicate scanning is not supported in this environment.",
        results: [],
      };
    }

    // 3) SEO (ยังไม่รองรับใน fallback)
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
