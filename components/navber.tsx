"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./Language/LanguageSwitcher";
import { supabase } from "@/lib/supabaseClient"; // ✅ แก้ตรงนี้
import type { User } from "@supabase/supabase-js";
import { syncCurrentUserProfile } from "@/lib/userProfile";

import { useLang } from "@/components/Language/LanguageProvider";

export function Navbar() {
  const { t } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ===============================
  // scroll shadow
  // ===============================
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 5);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ===============================
  // auth listener
  // ===============================
  useEffect(() => {
    console.log("🔔 Navbar auth init");

    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      console.log("👤 initial user:", u?.id);
      setUser(u);
      if (u) syncCurrentUserProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      console.log("🔁 auth change:", _event, u?.id);
      setUser(u);
      if (u) syncCurrentUserProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ===============================
  // actions
  // ===============================
  const loginWithDiscord = async () => {
    console.log("🔐 login with discord");
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const logout = async () => {
    console.log("🚪 logout");
    await supabase.auth.signOut();
    window.location.reload();
  };

  // ===============================
  // render
  // ===============================
  return (
    <>
      <div
        className={`navbar bg-base-100 border-b border-base-200 sticky top-0 z-40 
          transition-shadow duration-300
          ${isScrolled ? "shadow-md shadow-base-300/50" : ""}
        `}
      >
        {/* LEFT logo */}
        <Link
          href="/"
          className="flex-1 flex items-center gap-3 ml-4 cursor-pointer"
        >
          <img src="/logo.png" alt="logo" className="h-10 w-auto" />
        </Link>

        {/* DESKTOP Menu */}
        <div className="hidden md:flex flex-none items-center gap-3 mr-4">
          <ThemeSwitcher />
          <LanguageSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70 max-w-[140px] truncate">
                {user.user_metadata?.full_name || "Logged in"}
              </span>
              <button onClick={logout} className="btn btn-sm btn-outline">
                {t.navbar.logout}
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithDiscord}
              className="btn btn-sm btn-primary"
            >
              {t.navbar.login}
            </button>
          )}
        </div>

        {/* MOBILE Hamburger */}
        <div className="md:hidden mr-4">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-64 max-w-[80%] bg-base-100 border-l border-base-300 shadow-2xl z-50 p-4 md:hidden flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <button
                className="btn btn-xs btn-ghost ml-auto"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="border-b border-base-300 pb-3">
              {user ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm opacity-80">
                    {user.user_metadata?.full_name || "Logged in"}
                  </span>
                  <button
                    onClick={logout}
                    className="btn btn-sm btn-outline w-full"
                  >
                    {t.navbar.logout}
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithDiscord}
                  className="btn btn-sm btn-primary w-full"
                >
                  {t.navbar.login}
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </>
      )}
    </>
  );
}
