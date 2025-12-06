"use client";

import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./Language/LanguageSwitcher";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { syncCurrentUserProfile } from "@/lib/userProfile";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div
      className={`navbar bg-base-100 border-b border-base-200 sticky top-0 z-40 
        transition-shadow duration-300
        ${isScrolled ? "shadow-md shadow-base-300/50" : ""}
      `}
    >
      <div className="flex-1">
        <img
          src="/logo.png"
          alt="logo"
          className="h-10 md:h-10 w-auto ml-12"
        />
      </div>

      <div className="flex-none flex items-center gap-3 mr-4">
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
    </div>
  );
}
