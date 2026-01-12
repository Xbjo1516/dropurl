"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/components/Language/LanguageProvider";
import ExportDialog, {
  TestResultRow as ExportRowType,
} from "@/components/modal/ExportDialog";

export type TestResultRow = ExportRowType & {
  crossDuplicates?: string[];
  meta?: { crossDuplicates?: string[] };
};

type ResultTableProps = {
  rows: TestResultRow[];
  isCrawl?: boolean;
};

type FilterType = "all" | "404" | "duplicate" | "seo";
type CrawlStatusFilter = "all" | "ok" | "issue";

function getResourceLabel(u: string): string {
  try {
    const url = new URL(u);
    const pathname = url.pathname || "/";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) return decodeURIComponent(parts[parts.length - 1]);
    return url.hostname;
  } catch {
    const parts = u.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : u;
  }
}

function getHostname(u: string): string {
  try {
    const url = new URL(u);
    return url.hostname;
  } catch {
    return u;
  }
}

export default function ResultTable({
  rows,
  isCrawl = false,
}: ResultTableProps) {

  const { t } = useLang();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatusFilter>("all");

  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, crawlStatus, rows]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getBadgeClass = (type: string) => {
    const ttype = String(type || "").toLowerCase();
    if (ttype.includes("404"))
      return "border-orange-200 bg-orange-50 text-orange-700";
    if (ttype.includes("dup") || ttype.includes("duplicate"))
      return "border-purple-200 bg-purple-50 text-purple-700";
    if (ttype.includes("seo"))
      return "border-sky-200 bg-sky-50 text-sky-700";
    return "border-slate-200 bg-slate-50 text-slate-700";
  };

  const getGroupLabel = (raw: string) => {
    const map: Record<string, string> = {
      Basic: t.result.groupBasic,
      Indexing: t.result.groupIndexing,
      Structure: t.result.groupStructure,
      Social: t.result.groupSocial,
      "Schema & Links": t.result.groupSchemaLinks,
      Quality: t.result.groupQuality,
    };
    return map[raw] || raw || t.result.groupOthers;
  };

  const groupSeoIssues = (summary: string) => {
    const items = summary
      ? summary
        .split(/\r?\n|\|/)
        .map((s) => s.trim())
        .filter(Boolean)
      : [];
    const groups: Record<string, string[]> = {};
    let current = t.result.groupOthers;

    items.forEach((line) => {
      const m = line.match(/^\[(.+?)\]\s*(.*)$/);
      if (m) {
        current = m[1];
        if (!groups[current]) groups[current] = [];
        if (m[2]) groups[current].push(m[2]);
      } else {
        if (!groups[current]) groups[current] = [];
        groups[current].push(line);
      }
    });

    return groups;
  };

  const filteredRows = rows.filter((row) => {
    const hasIssue = !!row.hasIssue;

    // 🕷️ Crawl mode → filter ตามสถานะ
    if (isCrawl) {
      if (crawlStatus === "ok") return !hasIssue;
      if (crawlStatus === "issue") return hasIssue;
      return true; // all
    }

    // 🔍 Single mode → filter ตาม test type
    const ttype = (row.testType || "").toLowerCase();
    if (filterType === "404") return ttype.includes("404");
    if (filterType === "duplicate")
      return ttype.includes("dup") || ttype.includes("duplicate");
    if (filterType === "seo") return ttype.includes("seo");
    return true;
  });

  const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allSelected =
    filteredRows.length > 0 &&
    filteredRows.every((r) => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredRows.some((r) => r.id === id))
      );
    } else {
      const ids = filteredRows.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  if (rows.length === 0) return null;

  const filterLabelMap: Record<FilterType, string> = {
    all: t.result.filterAll,
    "404": t.result.filter404,
    duplicate: t.result.filterDuplicate,
    seo: t.result.filterSeo,
  };

  const changeFilter = (type: FilterType) => setFilterType(type);

  const selectedInView = selectedIds.filter((id) =>
    filteredRows.some((r) => r.id === id)
  ).length;

  const selectedSummaryText = (t.result.selectedSummary || "{{selected}} / {{total}}")
    .replace("{{selected}}", String(selectedInView))
    .replace("{{total}}", String(filteredRows.length));

  return (
    <div className="mt-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile hamburger filter */}

          <div className="sm:hidden">
            <div className="dropdown dropdown-start">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-square btn-xs"
                aria-label={t.result.menuLabel ?? "Open menu"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-56 mt-2 text-sm"
                style={{ minWidth: 220 }}
              >
                <li className="menu-title px-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {isCrawl ? "สถานะ" : t.result.filterLabel}
                  </span>
                </li>

                {isCrawl ? (
                  <>
                    <li>
                      <button
                        className={`text-left w-full ${crawlStatus === "all" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => setCrawlStatus("all")}
                      >
                        {t.result.filterAll}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${crawlStatus === "ok" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => setCrawlStatus("ok")}
                      >
                        {t.result.filterOK}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${crawlStatus === "issue" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => setCrawlStatus("issue")}
                      >
                        {t.result.filterHasIssue}
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        className={`text-left w-full ${filterType === "all" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("all")}
                      >
                        {t.result.filterAll}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${filterType === "404" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("404")}
                      >
                        {t.result.filter404}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${filterType === "duplicate" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("duplicate")}
                      >
                        {t.result.filterDuplicate}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${filterType === "seo" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("seo")}
                      >
                        {t.result.filterSeo}
                      </button>
                    </li>
                  </>
                )}

                <li className="border-t border-slate-200" />

                <li>
                  <button
                    className="text-left w-full"
                    onClick={() => {
                      const visible = filteredRows.map((r) => r.id);
                      setSelectedIds((prev) =>
                        Array.from(new Set([...prev, ...visible]))
                      );
                    }}
                  >
                    {t.result.selectVisible || "Select visible"}
                  </button>
                </li>
                <li>
                  <button
                    className="text-left w-full"
                    onClick={() => setSelectedIds([])}
                  >
                    {t.result.clearSelection || "Clear selection"}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <h2 className="hidden md:block text-sm font-semibold text-slate-700">
            {t.result.title}
          </h2>

          <div className="hidden sm:block ml-2">
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                type="button"
                className="btn btn-sm btn-ghost border border-slate-200 normal-case text-[11px] h-8 min-h-0 w-36 text-left"
              >
                <span className="mr-1">
                  {isCrawl ? t.result.filterstatus + ":" : t.result.filterLabel + ":"}
                </span>
                <span className="font-semibold">
                  {isCrawl
                    ? crawlStatus === "all"
                      ? t.result.filterAll
                      : crawlStatus === "ok"
                        ? t.result.filterOK
                        : t.result.filterHasIssue
                    : filterLabelMap[filterType]}
                </span>
              </button>

              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 mt-2 text-[11px] z-10"
              >
                {isCrawl ? (
                  <>
                    <li>
                      <button
                        className={`text-left w-full ${crawlStatus === "all" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => setCrawlStatus("all")}
                      >
                        {t.result.filterAll}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${crawlStatus === "ok" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => setCrawlStatus("ok")}
                      >
                        {t.result.filterOK}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${crawlStatus === "issue" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => setCrawlStatus("issue")}
                      >
                        {t.result.filterHasIssue}
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <button
                        className={`text-left w-full ${filterType === "all" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("all")}
                      >
                        {t.result.filterAll}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${filterType === "404" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("404")}
                      >
                        {t.result.filter404}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${filterType === "duplicate" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("duplicate")}
                      >
                        {t.result.filterDuplicate}
                      </button>
                    </li>

                    <li>
                      <button
                        className={`text-left w-full ${filterType === "seo" ? "font-semibold text-primary" : ""
                          }`}
                        onClick={() => changeFilter("seo")}
                      >
                        {t.result.filterSeo}
                      </button>
                    </li>
                  </>
                )}

              </ul>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{selectedSummaryText}</span>

          <ExportDialog
            rows={filteredRows as ExportRowType[]}
            selectedIds={selectedIds}
            triggerLabel={t.result.exportButton || "Export"}
            pageSize={5}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 w-[40px]">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label={t.result.selectAll || "Select all"}
                />
              </th>
              <th className="px-3 py-2 w-[32%]">{t.result.columnUrl}</th>
              <th className="px-3 py-2 w-[12%]">
                {t.result.columnTestType}
              </th>
              <th className="px-3 py-2 w-[16%]">
                {t.result.columnHasIssue}
              </th>
              <th className="px-3 py-2 w-[36%]">
                {t.result.columnIssueSummary}
              </th>
            </tr>
          </thead>


          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  {t.result.noMatchData}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                const isSEO = (row.testType || "").toLowerCase().includes("seo");
                const isDup = (row.testType || "").toLowerCase().includes("dup");

                const groupedSEO = isSEO ? groupSeoIssues(row.issueSummary || "") : null;
                const crossDuplicates =
                  row.crossDuplicates ?? row.meta?.crossDuplicates ?? [];
                const hostname = getHostname(row.url || "");

                let effectiveHasIssue = !!row.hasIssue;

                if (isDup && Array.isArray(crossDuplicates) && crossDuplicates.length > 0) {
                  effectiveHasIssue = true;
                }

                return (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-100 ${isSelected
                      ? "bg-sky-50/60"
                      : effectiveHasIssue
                        ? "bg-red-50/20"
                        : "bg-white"
                      }`}
                  >
                    <td className="px-3 py-2 align-top">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={isSelected}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Select row ${row.url}`}
                      />
                    </td>

                    <td className="px-3 py-2 align-top max-w-xs">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-600 hover:underline break-words"
                      >
                        {row.url}
                      </a>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${getBadgeClass(
                          row.testType
                        )}`}
                      >
                        {row.testType}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-[11px] font-medium ${effectiveHasIssue
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                          }`}
                      >
                        {effectiveHasIssue
                          ? t.result.statusHasIssue
                          : t.result.statusNoIssue}
                      </span>
                    </td>

                    <td className="px-3 py-2 align-top text-xs text-slate-700 max-w-[420px] break-words whitespace-pre-wrap">
                      {isSEO && groupedSEO ? (
                        <div className="space-y-1.5">
                          {Object.entries(groupedSEO).map(([group, items]) => (
                            <div key={group}>
                              <div className="font-semibold text-[11px] text-slate-500 mb-0.5">
                                {getGroupLabel(group)}
                              </div>
                              <ol className="list-decimal list-inside space-y-0.5">
                                {items.map((text, i) => (
                                  <li key={i}>{text}</li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </div>
                      ) : isDup ? (
                        <>
                          <div className="mb-1 text-[12px] text-red-600">
                            {t.result.duplicateProblemLabel ||
                              "Duplicate resources detected."}
                          </div>

                          {Array.isArray(crossDuplicates) &&
                            crossDuplicates.length > 0 ? (
                            <div className="text-[12px] text-slate-700 space-y-3">
                              {(() => {
                                const groups: Record<string, string[]> = {};

                                for (const u of crossDuplicates) {
                                  try {
                                    const host = new URL(u).hostname;
                                    const label = getResourceLabel(u);
                                    if (!groups[host]) groups[host] = [];
                                    groups[host].push(label);
                                  } catch {
                                    const host = "unknown";
                                    const label = getResourceLabel(u);
                                    if (!groups[host]) groups[host] = [];
                                    groups[host].push(label);
                                  }
                                }

                                return Object.entries(groups).map(
                                  ([domain, files], idx) => (
                                    <div
                                      key={idx}
                                      className="border-b border-slate-200 pb-2"
                                    >
                                      <div className="font-semibold text-[11px] text-slate-500 mb-1">
                                        {domain}
                                      </div>

                                      <ul className="list-disc list-inside space-y-0.5">
                                        {files.map((f, i2) => (
                                          <li key={i2}>{f}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )
                                );
                              })()}
                            </div>
                          ) : (
                            <div>{row.issueSummary || "-"}</div>
                          )}
                        </>
                      ) : (
                        <div>{row.issueSummary || "-"}</div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 my-4">
            <button
              className="btn btn-xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`btn btn-xs ${page === currentPage ? "btn-primary" : "btn-ghost"
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              className="btn btn-xs"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}