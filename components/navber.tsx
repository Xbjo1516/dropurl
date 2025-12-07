"use client";

import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./Language/LanguageSwitcher";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { syncCurrentUserProfile } from "@/lib/userProfile";

const supabase = getSupabaseClient();

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // สำหรับมือถือ

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 5);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) syncCurrentUserProfile();
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) syncCurrentUserProfile();
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const loginWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <>
      <div
        className={`navbar bg-base-100 border-b border-base-200 sticky top-0 z-40 
          transition-shadow duration-300
          ${isScrolled ? "shadow-md shadow-base-300/50" : ""}
        `}
      >
        {/* LEFT logo */}
        <div className="flex-1 flex items-center gap-3 ml-4">
          <img src="/logo.png" alt="logo" className="h-10 w-auto" />
        </div>

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
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithDiscord}
              className="btn btn-sm btn-primary"
            >
              Login with Discord
            </button>
          )}
        </div>

        {/* MOBILE Hamburger */}
        <div className="md:hidden mr-4">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {/* Hamburger icon */}
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

      {/* MOBILE SIDEBAR + OVERLAY */}
      {menuOpen && (
        <>
          {/* พื้นหลังมืด คลิกแล้วปิดเมนู */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Sidebar ด้านขวา */}
          <div className="fixed top-0 right-0 h-full w-64 max-w-[80%] bg-base-100 border-l border-base-300 shadow-2xl z-50 p-4 md:hidden flex flex-col gap-4">
            {/* header ด้านบนของ sidebar */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* <img src="/logo.png" alt="logo" className="h-8 w-auto" />
                <span className="font-semibold text-sm">Menu</span> */}
              </div>
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* user / login */}
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
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithDiscord}
                  className="btn btn-sm btn-primary w-full"
                >
                  Login with Discord
                </button>
              )}
            </div>

            {/* Theme + Language ในรูปแบบหัวข้อใหญ่/ย่อย (ตัวคอมโพเนนต์ที่คุณแก้แล้วจะจัดการเองตามขนาดจอ) */}
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
