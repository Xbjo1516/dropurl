// /pages/api/check-url.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { check404 } from "../../test/404";
import { checkDuplicate } from "../../test/duplicate";
import { checkSeo } from "../../test/read-elements";

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
    checks?: { check404?: boolean; duplicate?: boolean; seo?: boolean };
  };

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({
      error: true,
      errorMessage: "urls must be a non-empty array",
    });
  }

  try {
    const result: any = {};

    async function safeRun(label: string, fn: () => Promise<any>) {
      try {
        return await fn();
      } catch (err: any) {
        console.error(`[${label}] failed:`, err);
        return {
          error: true,
          errorMessage: err?.message || String(err),
          results: urls!.map((url) => ({
            url,
            reachable: false,
            error: err?.message || "Unknown error",
          })),
        };
      }
    }

    // 404
    if (checks?.check404) {
      result.check404 = await safeRun("404", () => check404(urls));
    }

    // DUPLICATE
    if (checks?.duplicate) {
      result.duplicate = await safeRun("duplicate", () => checkDuplicate(urls));

      try {
        console.log(
          "DEBUG duplicate raw result:",
          JSON.stringify(result.duplicate, null, 2)
        );
      } catch (e) {
        console.log(
          "DEBUG duplicate raw result (stringify failed):",
          result.duplicate
        );
      }

      try {
        const dupRes = result.duplicate;
        const items =
          dupRes?.results && Array.isArray(dupRes.results)
            ? dupRes.results
            : [];

        const detectedInternal = items.some((it: any) => {
          if (Array.isArray(it.frames) && it.frames.length > 0) return true;
          if (Array.isArray(it.duplicates) && it.duplicates.length > 0)
            return true;
          if (it?.frames && Object.keys(it.frames).length > 0) return true;
          return false;
        });

        const hashToUrls: Record<string, Set<string>> = {};

        try {
          for (const item of items) {
            if (Array.isArray(item.frames)) {
              for (const f of item.frames) {
                if (f && f.hash) {
                  if (!hashToUrls[f.hash]) hashToUrls[f.hash] = new Set();
                  if (item.url) hashToUrls[f.hash].add(item.url);
                  if (Array.isArray(f.duplicates)) {
                    for (const d of f.duplicates) {
                      if (d) hashToUrls[f.hash].add(String(d));
                    }
                  }
                }
              }
            }

            if (item.debug && Array.isArray(item.debug.sampleGroups)) {
              for (const sg of item.debug.sampleGroups) {
                if (sg && sg.hash && Array.isArray(sg.urls)) {
                  if (!hashToUrls[sg.hash]) hashToUrls[sg.hash] = new Set();
                  sg.urls.forEach((u: string) => {
                    if (u) hashToUrls[sg.hash].add(u);
                  });
                  if (item.url) hashToUrls[sg.hash].add(item.url);
                }
              }
            }
          }
        } catch (e) {
          console.log(
            "Failed building hash->urls map (non-fatal in API):",
            e
          );
        }

        const crossPageDuplicates: { hash: string; urls: string[] }[] = [];
        for (const [h, s] of Object.entries(hashToUrls)) {
          const arr = Array.from(s);
          if (arr.length > 1) {
            crossPageDuplicates.push({ hash: h, urls: arr });
          }
        }

        const detected = detectedInternal || crossPageDuplicates.length > 0;

        result.duplicateSummary = {
          detected,
          itemsCount: items.length,
          crossPageDuplicates,
        };

        console.log("DEBUG duplicate summary:", result.duplicateSummary);
      } catch (e) {
        console.log("DEBUG duplicate summary failed:", e);
      }
    }

    // SEO
    if (checks?.seo) {
      result.seo = await safeRun("seo", () => checkSeo(urls));
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
