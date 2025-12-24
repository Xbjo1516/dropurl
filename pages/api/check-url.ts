// /pages/api/check-url.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Checks = {
  all?: boolean;
  check404?: boolean;
  duplicate?: boolean;
  seo?: boolean;
};

type WorkerResult = {
  error: boolean;
  result: {
    check404?: { error: boolean; results: any[] };
    duplicate?: { error: boolean; results: any[] };
    seo?: { error: boolean; results: any[] };
    duplicateSummary?: {
      detected: boolean;
      itemsCount: number;
      crossPageDuplicates: { hash: string; urls: string[] }[];
    };
  };
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: true });
  }

  const { urls, checks } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: true, errorMessage: "Invalid urls" });
  }

  const WORKER_URL = process.env.DROPURL_WORKER_URL;
  if (!WORKER_URL) {
    return res.status(500).json({
      error: true,
      errorMessage: "WORKER_URL not configured",
    });
  }

  const normalizedUrls = urls.map((u: string) => {
    const s = String(u || "").trim();
    if (!s) return s;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `https://${s}`;
  });

  const isSingleUrl = normalizedUrls.length === 1;

  const normalizedChecks: Checks = {
    check404: checks?.all ?? checks?.check404 ?? true,
    duplicate: checks?.all ?? checks?.duplicate ?? true,
    seo: checks?.all ?? checks?.seo ?? true,
  };

  const batches = chunkArray(normalizedUrls, 10);


  const merged: WorkerResult["result"] = {
    check404: { error: false, results: [] },
    duplicate: { error: false, results: [] },
    seo: { error: false, results: [] },
    duplicateSummary: {
      detected: false,
      itemsCount: 0,
      crossPageDuplicates: [],
    },
  };

  try {
    for (let i = 0; i < batches.length; i++) {
      console.log(`Batch ${i + 1}/${batches.length}`, batches[i]);

      const controller = new AbortController();

      const timeoutMs = isSingleUrl ? 60000 : 25000;

      const timeout = setTimeout(() => {
        controller.abort();
      }, timeoutMs);


      let resp: Response;

      console.log("RUN CHECKS:", {
        urls: batches[i],
        checks: normalizedChecks,
      });

      try {
        resp = await fetch(`${WORKER_URL}/run-checks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: batches[i],
            checks: normalizedChecks,
          }),
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          return res.status(200).json({
            error: false,
            partial: true,
            message: `Batch ${i + 1} timed out`,
          });
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }

      if (!resp.ok) {
        const text = await resp.text();
        return res.status(502).json({
          error: true,
          errorMessage: `Worker failed at batch ${i + 1}`,
          detail: text,
        });
      }

      const data: WorkerResult = await resp.json();

      data.result?.check404?.results &&
        merged.check404!.results.push(...data.result.check404.results);

      data.result?.duplicate?.results &&
        merged.duplicate!.results.push(...data.result.duplicate.results);

      data.result?.seo?.results &&
        merged.seo!.results.push(...data.result.seo.results);

      if (data.result?.duplicateSummary?.crossPageDuplicates?.length) {
        merged.duplicateSummary!.crossPageDuplicates.push(
          ...data.result.duplicateSummary.crossPageDuplicates
        );
      }
    }

    merged.duplicateSummary!.itemsCount =
      merged.duplicateSummary!.crossPageDuplicates.length;
    merged.duplicateSummary!.detected =
      merged.duplicateSummary!.itemsCount > 0;

    return res.status(200).json({ error: false, result: merged });
  } catch (err: any) {
    console.error("check-url error:", err);
    return res.status(500).json({
      error: true,
      errorMessage: "Server error",
      detail: String(err),
    });
  }
}
