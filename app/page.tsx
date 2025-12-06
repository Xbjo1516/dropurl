"use client";

import { useState } from "react";
import { useLang } from "@/components/Language/LanguageProvider";
import HeroSection, { Checks } from "@/components/sites/input";
import InfoSection from "@/components/sites/info";
import ResultTable, { TestResultRow } from "@/components/sites/result";
import { normalizeUrl } from "@/utils/url";

export default function Home() {
  const { t } = useLang();
  const [urlsInput, setUrlsInput] = useState("");
  const [checks, setChecks] = useState<Checks>({
    all: true,
    check404: true,
    duplicate: true,
    seo: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TestResultRow[]>([]);

  const parseUrls = (text: string): string[] =>
    text
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const urls = parseUrls(urlsInput);

    if (!urls.length) {
      setError(t.home.errorRequired);
      setRows([]);
      return;
    }

    for (const rawUrl of urls) {
      try {
        const normalized =
          rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
            ? rawUrl
            : `https://${rawUrl}`;
        new URL(normalized);
      } catch {
        setError(t.home.errorInvalid);
        setRows([]);
        return;
      }
    }

    setError(null);
    setLoading(true);
    setRows([]);

    try {
      const res = await fetch("/api/check-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, checks }),
      });

      if (!res.ok) {
        let body: any = null;
        try {
          body = await res.json();
        } catch {
        }
        setError(body?.errorMessage || t.home.errorOther);
        setRows([]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data?.error) {
        setError(data.errorMessage || t.home.errorOther);
        setRows([]);
        setLoading(false);
        return;
      }

      const newRows: TestResultRow[] = [];

      const check404Result = data.result?.check404;
      const dupResult = data.result?.duplicate;
      const seoResult = data.result?.seo;

      if (
        checks.seo &&
        seoResult?.results &&
        Array.isArray(seoResult.results) &&
        seoResult.results.some((it: any) => it.reachable === false)
      ) {
        setError(t.home.errorInvalid);
        setRows([]);
        setLoading(false);
        return;
      }

      // ========== 1) 404 ==========
      if (
        checks.check404 &&
        check404Result?.results &&
        Array.isArray(check404Result.results)
      ) {
        check404Result.results.forEach((item: any, index: number) => {
          const hasIssue =
            item.pageStatus === 404 ||
            (item.iframe404s && item.iframe404s.length > 0) ||
            (item.assetFailures && item.assetFailures.length > 0);

          const problems: string[] = [];
          if (item.pageStatus === 404) {
            problems.push("Main page returns 404.");
          } else if (item.pageStatus === null) {
            problems.push(
              item.error
                ? `Fetch error: ${item.error}`
                : "No HTTP response (pageStatus=null)."
            );
          } else if (typeof item.pageStatus === "number") {
            problems.push(`HTTP ${item.pageStatus}`);
          } else {
            problems.push("No HTTP response information.");
          }

          if (item.iframe404s?.length) {
            problems.push(
              `Found ${item.iframe404s.length} iframe(s) with 404 errors.`
            );
          }
          if (item.assetFailures?.length) {
            problems.push(
              `Found ${item.assetFailures.length} asset(s) with 404 errors.`
            );
          }

          newRows.push({
            id: `404-${index}`,
            url: item.url ?? urls[index] ?? "-",
            testType: "404",
            hasIssue,
            issueSummary: problems.length ? problems.join(" | ") : "-",
          });
        });
      }

      // ========== 2) DUPLICATE  ==========
      if (
        checks.duplicate &&
        dupResult?.results &&
        Array.isArray(dupResult.results)
      ) {
        const simpleHash = (s: string) => {
          let h = 0;
          for (let i = 0; i < s.length; i++) {
            h = (h << 5) - h + s.charCodeAt(i);
            h |= 0;
          }
          return Math.abs(h);
        };

        dupResult.results.forEach((item: any, index: number) => {
          try {
            if (!item || typeof item !== "object") {
              newRows.push({
                id: `DUP-${index}-invalid`,
                url: typeof item === "string" ? item : `unknown-${index}`,
                testType: "DUPLICATE",
                hasIssue: false,
                issueSummary:
                  "Duplicate check returned unexpected item format from server.",
              });
              return;
            }

            if (item.error || item._error || item.errorMessage) {
              newRows.push({
                id: `DUP-${index}-err-${simpleHash(
                  String(item.url || item.bannerUrl || JSON.stringify(item))
                )}`,
                url:
                  item.url ??
                  item.bannerUrl ??
                  urls[index] ??
                  `unknown-${index}`,
                testType: "DUPLICATE",
                hasIssue: true,
                issueSummary: `Server reported error: ${item.errorMessage || item.error || JSON.stringify(item._error)
                  }`,
              });
              return;
            }

            const bannerUrl = String(
              item.bannerUrl ?? item.url ?? urls[index] ?? `unknown-${index}`
            );
            const frames = Array.isArray(item.frames) ? item.frames : [];
            const flatDuplicates = Array.isArray(item.duplicates)
              ? item.duplicates.map((d: any) => String(d))
              : [];

            const problemFrames = frames
              .map((f: any) => {
                const duplicates = Array.isArray(f?.duplicates)
                  ? f.duplicates.map((d: any) => String(d))
                  : [];
                const frameUrl = f?.frameUrl ?? f?.frame ?? f?.url ?? "iframe";
                return { frameUrl, duplicates, hash: f?.hash };
              })
              .filter((f: any) => f.duplicates && f.duplicates.length > 1); 

            if (flatDuplicates.length > 1) {
              problemFrames.unshift({
                frameUrl: "page",
                duplicates: flatDuplicates,
                hash: undefined,
              });
            }

            const domainMap = new Map<string, Set<string>>();

            const collectFromList = (urlList: string[]) => {
              for (const u of urlList) {
                try {
                  const nu = new URL(u);
                  const host = nu.hostname;
                  const parts = nu.pathname.split("/").filter(Boolean);
                  const filename = parts.length ? parts[parts.length - 1] : "/";

                  if (!domainMap.has(host)) domainMap.set(host, new Set());
                  domainMap.get(host)!.add(filename);
                } catch {
                  const host = "unknown";
                  if (!domainMap.has(host)) domainMap.set(host, new Set());
                  domainMap.get(host)!.add(u);
                }
              }
            };

            problemFrames.forEach((pf) => collectFromList(pf.duplicates));
            let hasIssue = domainMap.size > 0;

            let issueSummary = "-";
            if (hasIssue) {
              const lines: string[] = [];
              for (const [host, filesSet] of domainMap.entries()) {
                const files = Array.from(filesSet);
                lines.push(`${host}:`);
                files.forEach((f) => {
                  lines.push(`- ${f}`);
                });
                lines.push("");
              }

              issueSummary = lines.join("\n").trim();
            } else {
              issueSummary =
                item.summary ||
                item.message ||
                "No duplicated frames detected.";
            }

            const safeId = `DUP-${index}-${simpleHash(bannerUrl)}`;

            newRows.push({
              id: safeId,
              url: bannerUrl,
              testType: "DUPLICATE",
              hasIssue,
              issueSummary,
            } as TestResultRow);
          } catch (err: any) {
            console.warn("dup mapping failed for item:", item, err);
            newRows.push({
              id: `DUP-${index}-fallback`,
              url:
                item?.bannerUrl ??
                item?.url ??
                urls[index] ??
                `unknown-${index}`,
              testType: "DUPLICATE",
              hasIssue: false,
              issueSummary: `Could not parse duplicate result from server. (${err?.message ?? String(err)
                })`,
            });
          }
        });
      }

      // ========== 3) SEO ==========
      if (
        checks.seo &&
        seoResult?.results &&
        Array.isArray(seoResult.results)
      ) {
        seoResult.results.forEach((item: any, index: number) => {
          const url = item.rootUrl || item.originalUrl || urls[index] || "-";

          let hasIssue = false;

          const meta = item.meta || {};
          const p1 = meta.priority1 || {};
          const other = meta.other || {};
          const canonical = meta.canonical || {};
          const lang = meta.lang || {};
          const h = meta.seoHints || {};
          const headings = meta.headings || {};
          const og = meta.openGraph || {};
          const tw = meta.twitter || {};
          const schema = meta.schema || {};
          const links = meta.links || {};

          const detailLines: string[] = [];

          if (!item.reachable) {
            hasIssue = true;
            detailLines.push("[Basic] URL: ⛔ Not reachable");
          } else {
            detailLines.push("[Basic] URL: ✅ Reachable");
          }

          detailLines.push(`[Basic] charset: ${p1.charset || "⛔ Not found"}`);
          detailLines.push(`[Basic] viewport: ${p1.viewport || "⛔ Not found"}`);
          detailLines.push(`[Basic] title: ${p1.title || "⛔ Not found"}`);
          detailLines.push(
            `[Basic] description: ${p1.description || "⛔ Not found"}`
          );
          detailLines.push(
            `[Basic] robots meta: ${p1.robots || "⛔ Not found"}`
          );

          detailLines.push(
            `[Indexing] canonical: ${canonical.status || "⛔ missing"}`
          );
          detailLines.push(
            `[Indexing] html lang: ${lang.htmlLang ? `✅ ${lang.htmlLang}` : "⛔ Not found"
            }`
          );
          detailLines.push(
            `[Indexing] robots.txt: ${other["robots.txt"] || "⛔ Not found"}`
          );
          detailLines.push(
            `[Indexing] sitemap.xml: ${other["sitemap.xml"] || "⛔ Not found"}`
          );

          detailLines.push(
            `[Structure] H1: ${headings.h1Count > 0
              ? `✅ ${headings.h1Count} H1`
              : "⛔ No H1 on page"
            }`
          );
          detailLines.push(
            `[Structure] Heading tags: H1=${headings.h1Count || 0}, H2=${headings.h2Count || 0
            }, H3=${headings.h3Count || 0}`
          );

          if (
            h &&
            h.imageAltCoverage !== null &&
            typeof h.imageAltCoverage === "number"
          ) {
            const percent = Math.round(h.imageAltCoverage * 100);
            if (h.imageAltCoverage < 70) {
              hasIssue = true;
              detailLines.push(
                `[Structure] image alt coverage: ⛔ Low (${percent}% of images have alt)`
              );
            } else {
              detailLines.push(
                `[Structure] image alt coverage: ✅ ${percent}% of images have alt`
              );
            }
          }

          detailLines.push(
            `[Social] og:title: ${og["og:title"] || "⛔ Not found"}`
          );
          detailLines.push(
            `[Social] og:description: ${og["og:description"] || "⛔ Not found"
            }`
          );
          detailLines.push(
            `[Social] og:image: ${og["og:image"] || "⛔ Not found"}`
          );
          detailLines.push(
            `[Social] twitter:card: ${tw["twitter:card"] || "⛔ Not found"}`
          );
          detailLines.push(
            `[Social] twitter:title: ${tw["twitter:title"] || "⛔ Not found"
            }`
          );

          detailLines.push(
            `[Schema & Links] schema types: ${schema.types && schema.types.length
              ? `✅ ${schema.types.join(", ")}`
              : "⛔ Not found"
            }`
          );
          detailLines.push(
            `[Schema & Links] links: total ${links.total || 0} (internal: ${links.internal || 0
            }, external: ${links.external || 0})`
          );

          if (h) {
            if (typeof h.titleLength === "number") {
              detailLines.push(
                `[Quality] title length: ${h.titleLength} characters (${h.titleLengthOk
                  ? "✅ In recommended range"
                  : "⛔ Should be adjusted"
                })`
              );
              if (!h.titleLengthOk) hasIssue = true;
            }
            if (typeof h.descriptionLength === "number") {
              detailLines.push(
                `[Quality] description length: ${h.descriptionLength
                } characters (${h.descriptionLengthOk
                  ? "✅ In recommended range"
                  : "⛔ Should be adjusted"
                })`
              );
              if (!h.descriptionLengthOk) hasIssue = true;
            }

            if (!h.hasCanonical) hasIssue = true;
            if (!h.hasHtmlLang) hasIssue = true;
            if (!h.hasH1 || h.multipleH1) hasIssue = true;

            detailLines.push(
              `[Quality] Open Graph: ${h.hasOpenGraph ? "✅ present" : "⛔ missing"
              }`
            );
            detailLines.push(
              `[Quality] Twitter Card: ${h.hasTwitterCard ? "✅ present" : "⛔ missing"
              }`
            );
            detailLines.push(
              `[Quality] Structured Data (Schema): ${h.hasSchema ? "✅ present" : "⛔ missing"
              }`
            );
          }

          newRows.push({
            id: `SEO-${index}`,
            url,
            testType: "SEO",
            hasIssue,
            issueSummary: detailLines.join(" | "),
          });
        });
      }

      setRows(newRows);
    } catch (err: any) {
      console.error(err);
      setError(t.home.errorOther);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <HeroSection
        urlsInput={urlsInput}
        setUrlsInput={setUrlsInput}
        checks={checks}
        setChecks={setChecks}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />

      {rows.length > 0 && (
        <div className="w-full max-w-5xl mx-auto px-4 py-12">
          <div className="rounded-2xl shadow-xl border border-slate-200 bg-white p-6">
            <ResultTable rows={rows} />
          </div>
        </div>
      )}
      
      <InfoSection />
    </main>
  );
}
