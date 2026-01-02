export async function sendDiscordMessage(payload: {
    title: string;
    description: string;
    fields?: { name: string; value: string; inline?: boolean }[];
}) {
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) return;

    await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [
                {
                    title: payload.title,
                    description: payload.description,
                    color: 0x5865f2,
                    fields: payload.fields || [],
                    timestamp: new Date().toISOString(),
                },
            ],
        }),
    });
}
