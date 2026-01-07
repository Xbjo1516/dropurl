"use client";

import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

import { useLang } from "@/components/Language/LanguageProvider";
import HeroSection, { Checks } from "../components/sites/input";
import InfoSection from "@/components/sites/info";
import ResultTable, { TestResultRow } from "@/components/sites/result";
import Footer from "@/components/footer";
import CrawlTree from "@/components/sites/CrawlTree";
import type { CrawlResultItem } from "@/types/crawl";
import { buildCrawlTree } from "@/utils/buildCrawlTree";
import { DiscordHelpButton } from "@/components/BT/DiscordHelpButton";
import { DiscordHelpModal } from "@/components/modal/DiscordHelpModal";

type Mode = "single" | "crawl";

function mapCrawlToRows(
  crawlResults: CrawlResultItem[]
): TestResultRow[] {
  return crawlResults.map((item, index) => ({
    id: `CRAWL-${index}`,
    url: item.url,
    testType:
      item.status === 404
        ? "404"
        : item.status === null
          ? "ERROR"
          : "CRAWL",
    hasIssue: item.status === 404 || item.status === null || !!item.error,
    issueSummary: [
      `Status: ${item.status ?? "N/A"}`,
      `Depth: ${item.depth}`,
      item.from ? `Found on: ${item.from}` : null,
      item.error ? `Error: ${item.error}` : null,
    ]
      .filter(Boolean)
      .join(" | "),
  }));
}

export default function Home() {
  const { t } = useLang();

  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  const [mode, setMode] = useState<Mode>("single");
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
  const [crawlResults, setCrawlResults] = useState<CrawlResultItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const crawlTree = buildCrawlTree(crawlResults);

  const parseUrls = (text: string): string[] =>
    text
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

  function isValidHttpUrlStrict(input: string): boolean {
    let url: URL;

    try {
      url = new URL(input);
    } catch {
      return false;
    }

    // ต้องเป็น http หรือ https
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname;

    // ต้องมี dot (กัน https://kipso)
    if (!hostname.includes(".")) {
      return false;
    }

    // กัน localhost
    if (hostname === "localhost") {
      return false;
    }

    // กันชื่อสั้นเกิน
    if (hostname.length < 4) {
      return false;
    }

    return true;
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    options?: {
      maxDepth: number;
      sameDomainOnly: boolean;
    }
  ) => {
    e.preventDefault();

    const urls = parseUrls(urlsInput);

    // 1️⃣ ไม่กรอก URL
    if (!urls.length) {
      setError(t.home.errorRequired);
      setRows([]);
      return;
    }

    // 2️⃣ ตรวจ URL ซ้ำ
    const uniqueUrls = new Set(urls);
    if (uniqueUrls.size !== urls.length) {
      setError(t.home.errorDuplicate);
      setRows([]);
      return;
    }

    // 3️⃣ ตรวจรูปแบบ URL
    for (const rawUrl of urls) {
      if (!isValidHttpUrlStrict(rawUrl)) {
        setError(t.home.errorInvalid);
        setRows([]);
        setLoading(false);
        return;
      }
    }

    // 4️⃣ ตรวจว่า URL มีอยู่จริง (ผ่าน server)
    for (const rawUrl of urls) {
      try {
        const resp = await fetch("/api/validate-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: rawUrl }),
        });

        const data = await resp.json();

        if (!data.ok) {
          setError(
            t.home.errorNotFound
          );
          setRows([]);
          setLoading(false);
          return;
        }
      } catch {
        setError(
          t.home.errorOther
        );
        setRows([]);
        setLoading(false);
        return;
      }
    }

    if (
      mode === "single" &&
      !checks.all &&
      !checks.check404 &&
      !checks.duplicate &&
      !checks.seo
    ) {
      setError(t.home.errorMessage);
      setRows([]);
      setLoading(false);
      return;
    }

    if (mode === "crawl" && urls.length > 1) {
      setError(
        t.crawl.errorCrawlMultiUrl);
      setRows([]);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    setRows([]);
    setCrawlResults([]);

    if (mode === "crawl") {
      if (!options) return;

      const res = await fetch("/api/crawl-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urls[0],
          maxDepth: options.maxDepth,
          sameDomainOnly: options.sameDomainOnly,
          checks,
        }),
      });

      const data = await res.json();
      console.log("CRAWL RAW RESPONSE:", data);

      if (!res.ok || data?.error) {
        setError(data?.errorMessage || t.home.errorOther);
        setLoading(false);
        return;
      }

      // ===============================
      // 1️⃣ ใช้ crawlResults (ใหม่)
      // ===============================
      const crawlItems = data.crawlResults || [];
      setCrawlResults(crawlItems);

      // 2️⃣ แสดงผลตาราง
      const crawlRows = mapCrawlToRows(crawlItems);
      setRows(crawlRows);

      // ===============================
      // 3️⃣ 👉 SAVE DB ตรงนี้ (สำคัญ)
      // ===============================
      if (user && data.engineResult) {
        try {
          await fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auth_user_id: user.id,
              urls: [urls[0]],
              rawInput: urls[0],
              source: "web",
              engineResult: data.engineResult, // 👈 crawl ถูก save ตรงนี้
            }),
          });
        } catch (err) {
          console.error("Failed to save crawl check:", err);
        }
      }

      setLoading(false);
      return;
    }

    const allRows: TestResultRow[] = [];

    for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
      const url = urls[urlIndex];
      try {
        const res = await fetch("/api/check-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: [url], // ⭐ ส่งทีละ URL
            checks,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          setError(body?.errorMessage || t.home.errorOther);
          continue;
        }

        const data = await res.json();

        if (data?.error) {
          setError(data.errorMessage || t.home.errorOther);
          continue;
        }

        const newRows: TestResultRow[] = [];

        const check404Result = data.result?.check404;
        const dupResult = data.result?.duplicate;
        const seoResult = data.result?.seo;

        // ========== 1) 404 (Page-first + show HTTP status) ==========
        if (
          checks.check404 &&
          check404Result?.results &&
          Array.isArray(check404Result.results)
        ) {
          check404Result.results.forEach((item: any, index: number) => {
            const problems: string[] = [];
            let hasIssue = false;

            // 1️⃣ หน้าเป็น 404 → จบ
            if (item.pageStatus === 404) {
              hasIssue = true;
              problems.push("❌ This page returns HTTP 404 (page not found).");
            }

            // 2️⃣ หน้าไม่ 404
            else {
              // 2.1 fetch ไม่ได้
              if (item.pageStatus === null) {
                hasIssue = true;
                problems.push(
                  item.error
                    ? `❌ Page fetch failed: ${item.error}`
                    : "❌ No HTTP response from page."
                );
              } else {
                // 2.2 หน้า OK → แสดง HTTP status
                problems.push(`✅ Page returned HTTP ${item.pageStatus}.`);
              }

              // 2.3 ตรวจองค์ประกอบ (เฉพาะเมื่อหน้าไม่ตาย)
              if (item.iframe404s?.length) {
                hasIssue = true;
                problems.push(
                  `⚠ Found ${item.iframe404s.length} iframe(s) returning 404.`
                );
              }

              if (item.assetFailures?.length) {
                hasIssue = true;
                problems.push(
                  `⚠ Found ${item.assetFailures.length} asset(s) returning 404.`
                );
              }
            }

            newRows.push({
              id: `404-${urlIndex}-${index}`,
              url: item.url ?? url ?? "-",
              testType: "404",
              hasIssue,
              issueSummary: problems.join(" | "),
            });
          });
        }

        // ========== 2) DUPLICATE ==========
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
                  id: `DUP-${urlIndex}-${index}-invalid`,
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
                  id: `DUP-${urlIndex}-${index}-err-${simpleHash(
                    String(item.url || item.bannerUrl || JSON.stringify(item))
                  )}`,
                  url:
                    item.url ??
                    item.bannerUrl ??
                    urls[index] ??
                    `unknown-${index}`,
                  testType: "TIMEOUT",
                  hasIssue: true,
                  issueSummary:
                    "Unable to access this page (connection timed out)",
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

              problemFrames.forEach((pf: { duplicates: string[] }) =>
                collectFromList(pf.duplicates)
              );
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

              const safeId = `DUP-${urlIndex}-${index}-${simpleHash(bannerUrl)}`;

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
                id: `DUP-${urlIndex}-${index}-fallback`,
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
              `[Social] twitter:card: ${tw["twitter:card"] || "⛔ Not found"
              }`
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
                  `[Quality] title length: ${h.titleLength
                  } characters (${h.titleLengthOk
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
              id: `SEO-${urlIndex}-${index}`,
              url,
              testType: "SEO",
              hasIssue,
              issueSummary: detailLines.join(" | "),
            });
          });
        }
        allRows.push(...newRows);

      } catch (err) {
        console.error("check-url failed:", url, err);
        // ❌ ไม่ setRows([])
      }
    }

    if (user) {
      try {
        await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auth_user_id: user.id,
            urls,
            rawInput: urlsInput,
            source: "web",
            engineResult: {
              has404: allRows.some(
                (r) => r.testType === "404" && r.hasIssue
              ),
              hasDuplicate: allRows.some(
                (r) => r.testType === "DUPLICATE" && r.hasIssue
              ),
              hasSeoIssues: allRows.some(
                (r) => r.testType === "SEO" && r.hasIssue
              ),
              raw: {
                rows: allRows,
                checks,
              },
            },
          }),
        });
      } catch (err) {
        console.error("Failed to save check to DB:", err);
      }
    }

    // ✅ สำคัญมาก: ทำหลัง loop เท่านั้น
    setRows(allRows);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-base-100">

      <HeroSection
        mode={mode}
        setMode={setMode}
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
            <ResultTable rows={rows}
              isCrawl={mode === "crawl"} />
          </div>
        </div>
      )}

      {/* {mode === "crawl" && crawlTree && (
        <div className="w-full max-w-5xl mx-auto px-4 py-12">
          <div className="rounded-2xl shadow-xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold mb-4">
              Crawl result ({crawlResults.length} pages)
            </h2>

            <CrawlTree nodes={[crawlTree]} />
          </div>
        </div>
      )} */}

      <InfoSection />
      <Footer />

      <DiscordHelpButton onClick={() => setShowHelp(true)} />
      <DiscordHelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </main>
  );
}