"use client";

import { useLang } from "@/components/Language/LanguageProvider";

export default function TermsPage() {
  const { t } = useLang();

  return (
    <section className="px-5 py-24 bg-base-100 text-slate-800">
      <div className="max-w-[920px] mx-auto">
        <h2 className="text-4xl font-extrabold mb-2 text-slate-900">
          {t.terms.title}
        </h2>

        <p className="text-sm text-slate-500 mb-8">
          {t.terms.updated}
        </p>

        <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
          <p>{t.terms.intro}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s1_title}</h3>
          <p>{t.terms.s1_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s2_title}</h3>
          <ul className="list-disc pl-5 space-y-1">
            {t.terms.s2_list.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s3_title}</h3>
          <p>{t.terms.s3_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s4_title}</h3>
          <p>{t.terms.s4_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s5_title}</h3>
          <p>{t.terms.s5_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s6_title}</h3>
          <p>{t.terms.s6_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s7_title}</h3>
          <p>{t.terms.s7_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s8_title}</h3>
          <p>{t.terms.s8_desc}</p>

          <h3 className="text-xl font-semibold mt-8">{t.terms.s9_title}</h3>
          <p>
            {t.terms.s9_desc}{" "}
            <a href="mailto:support@dropurl.app" className="text-primary hover:underline">
              support@dropurl.app
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
