"use client";

import { useLang } from "./LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="dropdown dropdown-end">
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
  );
}
