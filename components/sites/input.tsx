"use client";

import { useLang } from "@/components/Language/LanguageProvider";
import { Dispatch, SetStateAction } from "react";

export type Checks = {
  all: boolean;
  check404: boolean;
  duplicate: boolean;
  seo: boolean;
};

type HeroSectionProps = {
  urlsInput: string;
  setUrlsInput: Dispatch<SetStateAction<string>>;
  checks: Checks;
  setChecks: Dispatch<SetStateAction<Checks>>;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function HeroSection({
  urlsInput,
  setUrlsInput,
  checks,
  setChecks,
  loading,
  error,
  onSubmit,
}: HeroSectionProps) {
  const { t } = useLang();

  const syncAll = (next: Checks): Checks => ({
    ...next,
    all: next.check404 && next.duplicate && next.seo,
  });

  return (
    <section className="relative bg-slate-900 text-white h-full flex flex-col justify-end items-center pb-16">
      {/* Header */}
      <div className="text-center px-4 my-8">
        <div className="flex-1">
          <div className="btn btn-ghost normal-case text-6xl font-extrabold">
            <span className="text-primary">Drop</span>
            <span className="ml-1">URL</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold m-4">
          {t.home.title}
        </h1>
        <p className="text-sm md:text-base text-slate-200 max-w-3xl mx-auto">
          {t.home.description}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-4xl px-4">
        <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200">
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-700">
            <span className="font-semibold mr-2 w-full md:w-auto">
              {t.home.tpye}
            </span>

            {/* All */}
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={checks.all}
                onChange={(e) => {
                  const value = e.target.checked;
                  setChecks({
                    all: value,
                    check404: value,
                    duplicate: value,
                    seo: value,
                  });
                }}
              />
              <span>All</span>
            </label>

            {/* 404 */}
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={checks.check404}
                onChange={(e) => {
                  const value = e.target.checked;
                  setChecks((prev) => syncAll({ ...prev, check404: value }));
                }}
              />
              <span>404</span>
            </label>

            {/* Duplicate */}
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={checks.duplicate}
                onChange={(e) => {
                  const value = e.target.checked;
                  setChecks((prev) => syncAll({ ...prev, duplicate: value }));
                }}
              />
              <span>duplicate</span>
            </label>

            {/* SEO */}
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={checks.seo}
                onChange={(e) => {
                  const value = e.target.checked;
                  setChecks((prev) => syncAll({ ...prev, seo: value }));
                }}
              />
              <span>SEO</span>
            </label>
          </div>


          {/* Form */}
          <form onSubmit={onSubmit}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.home.input}
            </label>
            <div className="flex flex-col gap-3">
              <textarea
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                placeholder={t.home.inputPlaceholder}
                className="min-h-[120px] border border-slate-300 rounded-lg px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <button
                type="submit"
                className="btn btn-primary w-full md:w-auto"
                disabled={loading}
              >
                {loading ? "Checking..." : t.home.buttonCheck}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-error">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
