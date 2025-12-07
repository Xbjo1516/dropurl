"use client";

import { useLang } from "./LanguageProvider";
import { useState } from "react";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 🖥 DESKTOP: dropdown แบบเดิม */}
      <div className="dropdown dropdown-end hidden md:block">
        <button tabIndex={0} className="btn btn-ghost btn-sm normal-case">
          🌐 {lang === "th" ? "ไทย" : "English"}
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 mt-2"
        >
          <li>
            <button onClick={() => setLang("th")}>ไทย</button>
          </li>
          <li>
            <button onClick={() => setLang("en")}>English</button>
          </li>
        </ul>
      </div>

      {/* 📱 MOBILE: หัวข้อใหญ่ → กดแล้วมีภาษาให้เลือก */}
      <div className="md:hidden w-full">
        <button
          type="button"
          className="w-full flex items-center justify-between text-sm font-semibold py-2 border-b border-base-300"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            🌐 <span>ภาษา</span>
          </span>
          <span>{mobileOpen ? "▲" : "▼"}</span>
        </button>

        {mobileOpen && (
          <div className="mt-2 pl-2 space-y-1">
            <button
              type="button"
              onClick={() => setLang("th")}
              className={`block w-full text-left text-xs px-2 py-1 rounded-md hover:bg-base-200 ${
                lang === "th" ? "bg-base-300 font-semibold" : ""
              }`}
            >
              ไทย
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`block w-full text-left text-xs px-2 py-1 rounded-md hover:bg-base-200 ${
                lang === "en" ? "bg-base-300 font-semibold" : ""
              }`}
            >
              English
            </button>
          </div>
        )}
      </div>
    </>
  );
}
