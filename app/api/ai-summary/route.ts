// app/api/ai-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { summarizeWithAI } from "@/lib/ai";

export const runtime = "nodejs"; // ใช้ Node runtime (จำเป็นกับ Gemini)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { urls, has404, hasDuplicate, hasSeoIssues, issueDetails, lang } = body;

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json(
                { error: true, message: "Invalid meta data" },
                { status: 400 }
            );
        }

        const summary = await summarizeWithAI(
            {
                urls,
                has404,
                hasDuplicate,
                hasSeoIssues,
                issueDetails,
            },
            lang === "en" ? "en" : "th"
        );

        return NextResponse.json({
            error: false,
            summary,
        });
    } catch (e: any) {
        console.error("AI summary API error:", e);
        return NextResponse.json(
            {
                error: true,
                message: "AI summary failed",
            },
            { status: 500 }
        );
    }
}
