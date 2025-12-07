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

export function DiscordHelpModal({ open, onClose }: DiscordHelpModalProps) {
    const { t, lang } = useLang();

    const [webhookUrl, setWebhookUrl] = useState("");
    const [botToken, setBotToken] = useState("");
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

    const handleSave = async () => {
        console.log("saving discord config:", { webhookUrl, botToken });
        onClose();
    };

    const handleLoginWithDiscord = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "discord",
            options: { redirectTo: window.location.origin },
        });
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
             w-full max-w-md mx-4 my-4
             rounded-2xl shadow-2xl
             p-4 sm:p-6
             max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
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

            {loadingUser && (
                <div className="py-6 text-center text-sm opacity-70">
                    {lang === "th"
                        ? "กำลังตรวจสอบสถานะ..."
                        : "Checking login status..."}
                </div>
            )}

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

            {!loadingUser && user && (
                <>
                    <p className="text-xs mb-2 text-base-content/70">
                        {t.discord.connectedAs}:{" "}
                        <span className="font-semibold">
                            {user.user_metadata?.full_name ||
                                user.user_metadata?.name ||
                                user.email ||
                                "Discord user"}
                        </span>
                    </p>

                    <div className="space-y-3 text-sm">
                        {/* webhook */}
                        <div>
                            <label className="font-semibold">
                                {t.discord.webhookLabel}
                            </label>
                            <input
                                type="text"
                                className="input input-sm input-bordered w-full"
                                value={webhookUrl}
                                placeholder="https://discord.com/api/webhooks/..."
                                onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <p className="text-[11px] opacity-60">
                                {t.discord.webhookDesc}
                            </p>
                        </div>

                        {/* bot token */}
                        <div>
                            <label className="font-semibold">
                                {t.discord.botTokenLabel}
                            </label>
                            <input
                                type="password"
                                className="input input-sm input-bordered w-full"
                                value={botToken}
                                placeholder="xxxxxxxxxxxx"
                                onChange={(e) => setBotToken(e.target.value)}
                            />
                            <p className="text-[11px] opacity-60">
                                {t.discord.botTokenDesc}
                            </p>
                        </div>

                        {/* flow example */}
                        <div className="border-t pt-3 text-[11px] space-y-1">
                            <p className="font-semibold">{t.discord.flowTitle}</p>
                            <ol className="list-decimal list-inside">
                                <li>{t.discord.flow1}</li>
                                <li>{t.discord.flow2}</li>
                                <li>{t.discord.flow3}</li>
                                <li>{t.discord.flow4}</li>
                            </ol>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>
                            {t.discord.cancel}
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSave}
                            disabled={!webhookUrl && !botToken}
                        >
                            {t.discord.save}
                        </button>
                    </div>
                </>
            )}
        </div>
        </div >
    );
}
