"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/components/Language/LanguageProvider";

export type TestResultRow = {
  id: string;
  url: string;
  testType: string;
  hasIssue: boolean;
  issueSummary: string;
};

type ExportDialogProps = {
  rows: TestResultRow[]; 
  selectedIds: string[]; 
  triggerLabel?: string;
  pageSize?: number;
};

export default function ExportDialog({
  rows,
  selectedIds,
  triggerLabel,
  pageSize = 5,
}: ExportDialogProps) {
  const { t } = useLang();
  const labelTrigger = triggerLabel ?? t.export?.btnTrigger ?? "Export";

  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"json" | "txt">("json");
  const [page, setPage] = useState(1);

  const selectedRows = useMemo(() => {
    const map = new Map(rows.map((r) => [r.id, r]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as TestResultRow[];
  }, [rows, selectedIds]);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, selectedIds.join(","), rows.length]);

  const totalPages = Math.max(1, Math.ceil(selectedRows.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageItems = selectedRows.slice(startIdx, startIdx + pageSize);

  function downloadFile(filename: string, content: string, mime = "text/plain") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function formatExportDate(date: Date) {
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function onExport() {
    if (!selectedRows.length) return;
    const exportRows = [...selectedRows].sort((a, b) => {
      if (a.hasIssue !== b.hasIssue) {
        return a.hasIssue ? -1 : 1; 
      }
      if (a.testType !== b.testType) {
        return a.testType.localeCompare(b.testType);
      }
      return a.url.localeCompare(b.url);
    });

    const now = new Date();
    const exportedAtText = formatExportDate(now);
    const exportedAtISO = now.toISOString();

    if (format === "json") {
      const payload = {
        exportedAt: exportedAtText,
        exportedAtISO,
        total: exportRows.length,
        items: exportRows.map((r, index) => ({
          no: index + 1,
          id: r.id,
          url: r.url,
          testType: r.testType,
          hasIssue: r.hasIssue,
          issueSummary: r.issueSummary,
        })),
      };

      downloadFile(
        "export-urls.json",
        JSON.stringify(payload, null, 2),
        "application/json"
      );
    } else {
      const headerLines = [
        `Exported at: ${exportedAtText}`,
        `Total items: ${exportRows.length}`,
        "",
        "No.\tURL\tType\tStatus\tSummary",
      ];

      const lines = exportRows.map((r, index) => {
        const status = r.hasIssue ? "ISSUE" : "OK";
        return `${index + 1}\t${r.url}\t[${r.testType}]\t${status}\t${r.issueSummary}`;
      });

      const content = [...headerLines, ...lines].join("\n");
      downloadFile("export-urls.txt", content, "text/plain");
    }

    setOpen(false);
  }

  const onBackdropClick = () => setOpen(false);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open, onKeyDown]);

  const fill = (template: string | undefined, vars: Record<string, any>) => {
    if (!template) return "";
    return Object.keys(vars).reduce(
      (s, k) => s.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), String(vars[k])),
      template
    );
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={t.export?.title ?? "Export dialog"}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div
        className="relative bg-base-100 rounded-lg shadow-xl w-full max-w-xl sm:max-w-3xl overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "calc(90vh - 4rem)" }}
      >
        <div className="p-4 md:p-6">
          <h3 className="font-bold text-lg">{t.export?.title ?? "Export selected URLs"}</h3>
          <p className="text-sm text-slate-600 mb-3">
            {fill(t.export?.description, { count: selectedRows.length }) ||
              `Export ${selectedRows.length} item(s). Select file format and click Export.`}
          </p>

          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="text-sm">
              {fill(t.export?.selectedCount, { count: selectedRows.length }) ||
                `${selectedRows.length} selected`}
            </div>

            <div className="form-control">
              <div className="flex gap-3 items-center">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="fmt"
                    className="radio radio-xs"
                    checked={format === "json"}
                    onChange={() => setFormat("json")}
                  />
                  <span className="text-sm">{t.export?.formatJSON ?? "JSON"}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="fmt"
                    className="radio radio-xs"
                    checked={format === "txt"}
                    onChange={() => setFormat("txt")}
                  />
                  <span className="text-sm">{t.export?.formatTXT ?? "TXT"}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto border border-base-300 rounded-md p-2 mb-4 bg-white/0">
            {selectedRows.length === 0 ? (
              <p className="text-sm text-slate-500">
                {t.export?.noItems ?? "No items selected."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <thead className="text-xs text-slate-500 border-b border-base-300">
                    <tr>
                      <th className="text-left py-2 px-2 w-[60%]">URL</th>
                      <th className="text-left py-2 px-2 w-[20%]">Type</th>
                      <th className="text-left py-2 px-2 w-[20%]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((r) => (
                      <tr key={r.id} className="align-top">
                        <td className="py-2 px-2 text-xs break-words">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-600 hover:underline"
                          >
                            {r.url}
                          </a>
                        </td>
                        <td className="py-2 px-2 text-xs">{r.testType}</td>
                        <td className="py-2 px-2 text-xs">
                          {r.hasIssue ? (
                            <span className="text-error text-xs">
                              {t.result?.statusHasIssue ?? "Has issue"}
                            </span>
                          ) : (
                            <span className="text-success text-xs">
                              {t.result?.statusNoIssue ?? "OK"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-slate-500">
                {fill(t.export?.showing, {
                  start: selectedRows.length === 0 ? 0 : startIdx + 1,
                  end: Math.min(startIdx + pageItems.length, selectedRows.length),
                  total: selectedRows.length,
                })}
              </div>

              <div className="join">
                <button
                  className="join-item btn btn-xs"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  «
                </button>

                <button className="join-item btn btn-xs no-animation" aria-hidden>
                  {fill(t.export?.pageLabel, { page, totalPages }) ||
                    `Page ${page} / ${totalPages}`}
                </button>

                <button
                  className="join-item btn btn-xs"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  »
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button className="btn btn-sm" onClick={() => setOpen(false)}>
              {t.export?.cancel ?? "Cancel"}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onExport}
              disabled={selectedRows.length === 0}
            >
              {t.export?.btnExport ?? "Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => setOpen(true)}
        title={selectedIds.length === 0 ? (t.export?.noItems ?? "No items selected") : ""}
        type="button"
      >
        {labelTrigger}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(modalNode, document.body)
        : null}
    </>
  );
}
