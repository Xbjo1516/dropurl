"use client";

import { useEffect, useState } from "react";

const THEMES = [
  // "light",
  // "dark",
  "cupcake",
  // "bumblebee",
  // "emerald",
  // "corporate",
  // "synthwave",
  // "retro",
  // "cyberpunk",
  "valentine",
  // "halloween",
  // "garden",
  // "forest",
  // "aqua",
  // "lofi",
  "pastel",
  // "fantasy",
  "wireframe",
  // "black",
  // "luxury",
  // "dracula",
  // "cmyk",
  // "autumn",
  // "business",
  // "acid",
  // "lemonade",
  // "night",
  // "coffee",
  // "winter",
  // "dim",
  // "nord",
  // "sunset",
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("cupcake");
  const [mobileOpen, setMobileOpen] = useState(false); // <- ใช้เฉพาะจอเล็ก

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const initial = saved && THEMES.includes(saved) ? saved : "cupcake";

    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const changeTheme = (t: string) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    window.localStorage.setItem("theme", t);
  };

  return (
    <>
      {/* 🖥 DESKTOP: dropdown แบบเดิม */}
      <div className="dropdown dropdown-end hidden md:block">
        <button tabIndex={0} className="btn btn-ghost btn-sm normal-case">
          <span className="mr-1">🎨</span>
          themes
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2 max-h-64 overflow-y-auto"
        >
          {THEMES.map((t) => (
            <li key={t}>
              <button
                className={t === theme ? "active" : ""}
                onClick={() => changeTheme(t)}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 📱 MOBILE: หัวข้อใหญ่ + ย่อยแบบ sidebar */}
      <div className="md:hidden w-full">
        {/* หัวข้อใหญ่ */}
        <button
          type="button"
          className="w-full flex items-center justify-between text-sm font-semibold py-2 border-b border-base-300"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            🎨 <span>ธีม / สีของหน้า</span>
          </span>
          <span>{mobileOpen ? "▲" : "▼"}</span>
        </button>

        {/* หัวข้อย่อย: รายการธีม */}
        {mobileOpen && (
          <div className="mt-2 max-h-56 overflow-y-auto space-y-1 pl-2 pr-1">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => changeTheme(t)}
                className={`w-full text-left text-xs px-2 py-1 rounded-md hover:bg-base-200 ${
                  theme === t ? "bg-base-300 font-semibold" : ""
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
