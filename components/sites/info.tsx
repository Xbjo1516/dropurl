"use client";

import { useLang } from "@/components/Language/LanguageProvider";

export default function InfoSection() {
  const { t } = useLang();

  return (
    <section className="bg-white text-slate-900 py-12 md:py-32">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {t.info.whatIsDropURLTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-700">
            {t.info.whatIsDropURLDesc}
          </p>
        </div>

        {/* 404 */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {t.info.check404Title}
          </h2>
          <p className="text-sm md:text-base text-slate-700">
            {t.info.check404Desc}
          </p>
        </div>

        {/* Duplicate */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {t.info.duplicateTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-700">
            {t.info.duplicateDesc}
          </p>
        </div>

        {/* SEO */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {t.info.seoTitle}
          </h2>
          <p className="text-sm md:text-base text-slate-700">
            {t.info.seoDesc}
          </p>
        </div>
      </div>
    </section>
  );
}
