"use client";

import { useEffect, useState } from "react";

const THEMES = [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>("cupcake");

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
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm normal-case"
      >
        <span className="mr-1">🎨</span>
        themes: {theme}
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 mt-2"
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
  );
}
