// /components/modal/DiscordHelpModal.tsx
"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useLang } from "@/components/Language/LanguageProvider";

const supabase = getSupabaseClient();

type DiscordHelpModalProps = {
  open: boolean;
  onClose: () => void;
};

type SupabaseUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

// อ่าน invite URL จาก env (ฝั่ง client ต้องเป็น NEXT_PUBLIC_*)
const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_BOT_INVITE_URL ||
  "https://discord.com/oauth2/authorize";

export function DiscordHelpModal({ open, onClose }: DiscordHelpModalProps) {
  const { t, lang } = useLang();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadUser = async () => {
      setLoadingUser(true);
      const { data } = await supabase.auth.getUser();
      if (!cancelled) {
        setUser((data.user as any) ?? null);
        setLoadingUser(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleLoginWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleOpenInvite = () => {
    window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-base-100 text-base-content
                   w-full max-w-md mx-2 rounded-2xl
                   shadow-2xl p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">{t.discord.title}</h2>
            <p className="text-xs text-base-content/70">
              {t.discord.description}
            </p>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Loading user */}
        {loadingUser && (
          <div className="py-6 text-center text-sm opacity-70">
            {lang === "th"
              ? "กำลังตรวจสอบสถานะล็อกอิน..."
              : "Checking login status..."}
          </div>
        )}

        {/* ยังไม่ล็อกอิน Supabase ด้วย Discord */}
        {!loadingUser && !user && (
          <div className="py-3 text-sm space-y-3">
            <p className="font-semibold">{t.discord.loginRequired}</p>
            <p className="text-xs opacity-70">{t.discord.loginInfo}</p>

            <div className="flex justify-end mt-3">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleLoginWithDiscord}
              >
                {t.discord.loginButton}
              </button>
            </div>
          </div>
        )}

        {/* ล็อกอินแล้ว → ปุ่มเชื่อมต่อบอท + ตัวอย่างการใช้งาน */}
        {!loadingUser && user && (
          <>
            <p className="text-xs mb-3 text-base-content/70">
              {t.discord.connectedAs}:{" "}
              <span className="font-semibold">
                {user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email ||
                  "Discord user"}
              </span>
            </p>

            <div className="space-y-4 text-sm">
              {/* ปุ่มเชื่อมต่อกับแชทบอท */}
              <div className="border rounded-lg p-3">
                <p className="font-semibold mb-1">
                  {lang === "th"
                    ? "เชื่อมต่อกับแชทบอท DropURL"
                    : "Connect DropURL chatbot"}
                </p>
                <p className="text-xs opacity-70 mb-3">
                  {lang === "th"
                    ? "เมื่อเชิญบอทไปที่เซิร์ฟเวอร์ของคุณแล้ว สามารถพิมพ์คำสั่งในห้องแชทเพื่อให้ DropURL ช่วยตรวจลิงก์ได้ทันที"
                    : "Invite the bot to your server, then type commands in any text channel to let DropURL inspect URLs for you."}
                </p>
                <button
                  className="btn btn-sm btn-primary w-full"
                  onClick={handleOpenInvite}
                >
                  {lang === "th"
                    ? "เชื่อมต่อ / เชิญแชทบอทไปยัง Discord Server"
                    : "Invite & connect DropURL bot to Discord"}
                </button>
              </div>

              {/* ตัวอย่างการใช้งานแชทบอท */}
              <div className="border rounded-lg p-3 text-xs space-y-2">
                <p className="font-semibold">
                  {lang === "th"
                    ? "แชทบอททำอะไรได้บ้าง?"
                    : "What can the chatbot do?"}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    {lang === "th"
                      ? "ตรวจสอบลิงก์แบบเดียวกับหน้าเว็บ DropURL: 404, Duplicate, และ SEO พื้นฐาน"
                      : "Run the same checks as the DropURL website: 404, duplicate content/assets, and basic SEO health."}
                  </li>
                  <li>
                    {lang === "th"
                      ? "ใช้งานได้จากหลายเซิร์ฟเวอร์ เพียงเชิญบอทไปยังเซิร์ฟเวอร์ที่ต้องการ"
                      : "Work from any server where the bot is invited."}
                  </li>
                  <li>
                    {lang === "th"
                      ? "รองรับทั้งภาษาไทยและอังกฤษ สามารถสลับภาษาได้ในห้องแชท"
                      : "Supports both Thai and English; you can switch language inside the chat."}
                  </li>
                </ul>

                <p className="font-semibold mt-3">
                  {lang === "th"
                    ? "ตัวอย่างคำสั่งที่ใช้บ่อย"
                    : "Common command examples"}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <code className="px-1 py-0.5 rounded bg-base-200">
                      !check https://example.com
                    </code>{" "}
                    –{" "}
                    {lang === "th"
                      ? "ให้บอทตรวจลิงก์นี้ (404 / Duplicate / SEO) แล้วสรุปผลเป็นข้อความยาวอ่านง่าย"
                      : "Ask the bot to scan this URL (404 / Duplicate / SEO) and send a detailed summary."}
                  </li>
                  <li>
                    <code className="px-1 py-0.5 rounded bg-base-200">
                      !lang th
                    </code>{" "}
                    /{" "}
                    <code className="px-1 py-0.5 rounded bg-base-200">
                      !lang en
                    </code>{" "}
                    –{" "}
                    {lang === "th"
                      ? "เปลี่ยนภาษาที่บอทใช้ตอบ (ต่อผู้ใช้แต่ละคน)"
                      : "Change the language the bot uses when replying (per user)."}
                  </li>
                </ul>

                <p className="mt-2 opacity-70">
                  {lang === "th"
                    ? "หลังจากเชิญบอทแล้ว ลองพิมพ์คำสั่งด้านบนในห้องข้อความที่ต้องการ แชทบอทจะตอบผลตรวจกลับมาที่ห้องเดิม"
                    : "Once the bot is invited, try the commands above in any text channel and it will respond with the scan result in that channel."}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                {t.discord.cancel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
