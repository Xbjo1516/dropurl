"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./Language/LanguageSwitcher";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 5); // มีเงาเมื่อเลื่อนลงนิดเดียว
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`navbar bg-base-100 border-b border-base-200 sticky top-0 z-40 transition-shadow duration-300 ${
        isScrolled ? "shadow-md shadow-base-300/50" : ""
      }`}
    >
      <div className="flex-1">
        <img
          src="/logo.png"
          alt="logo"
          className="h-10 md:h-10 w-auto ml-12"
        />
      </div>

      <div className="flex-none flex items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
