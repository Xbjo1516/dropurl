"use client";

import { useLang } from "@/components/Language/LanguageProvider";

export default function PrivacyPolicyPage() {
    const { t } = useLang();

    return (
        <section className="px-5 py-24 bg-base-100 text-slate-800">
            <div className="max-w-[920px] mx-auto">
                <h2 className="text-4xl font-extrabold mb-2 text-slate-900">
                    {t.privacy.title}
                </h2>

                <p className="text-sm text-slate-500 mb-8">
                    {t.privacy.updated}
                </p>

                <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
                    <p>{t.privacy.intro1}</p>
                    <p>{t.privacy.intro2}</p>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s1_title}</h3>
                    <p>{t.privacy.s1_desc}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        {t.privacy.s1_list.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                    <p>{t.privacy.s1_note}</p>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s2_title}</h3>
                    <p>
                        {t.privacy.s2_desc}
                        <br />
                        <a href="mailto:support@dropurl.app" className="text-primary hover:underline">
                            support@dropurl.app
                        </a>
                    </p>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s3_title}</h3>
                    <p>{t.privacy.s3_desc}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        {t.privacy.s3_list.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s4_title}</h3>
                    <p>{t.privacy.s4_desc1}</p>
                    <p>{t.privacy.s4_desc2}</p>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s5_title}</h3>
                    <p>{t.privacy.s5_desc1}</p>
                    <p>{t.privacy.s5_desc2}</p>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s6_title}</h3>
                    <p>{t.privacy.s6_desc}</p>

                    <h3 className="text-xl font-semibold mt-8">{t.privacy.s7_title}</h3>
                    <p>{t.privacy.s7_desc}</p>
                </div>
            </div>
        </section>
    );
}
