// /components/DiscordHelpButton.tsx
"use client";

import { useState } from "react";
import { useLang } from "@/components/Language/LanguageProvider";

type DiscordHelpButtonProps = {
  onClick: () => void;
};

export function DiscordHelpButton({ onClick }: DiscordHelpButtonProps) {
  const [hover, setHover] = useState(false);
  const { t } = useLang(); // 👈 ดึงภาษา

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tooltip ด้านซ้ายของน้อง ไม่ดัน layout */}
      {hover && (
        <div
          className="
            absolute right-full mr-3 top-1/2 -translate-y-1/2
            bg-base-200 text-base-content
            px-4 py-1.5 rounded-full shadow text-xs
            whitespace-nowrap
          "
        >
          {t.discord?.helpTooltip ?? "Open Droppy chatbot / connect Discord"}
        </div>
      )}

      {/* ตัวน้อง Droppy */}
      <button
        onClick={onClick}
        className="p-0 border-none bg-transparent cursor-pointer"
      >
        <img
          src="/droppy.png"
          alt="Droppy bot"
          className="h-20 w-20 pointer-events-none select-none"
        />
      </button>
    </div>
  );
}
