"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import th from "@/app/locales/th";
import en from "@/app/locales/en";

type Lang = "th" | "en";
type Messages = typeof th;

type LangContextType = {
  lang: Lang;
  t: Messages;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", l);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("lang") as Lang | null;
      if (saved === "th" || saved === "en") {
        setLangState(saved);
      }
    }
  }, []);

  const messages = lang === "th" ? th : en;

  return (
    <LangContext.Provider value={{ lang, t: messages, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return ctx;
}
