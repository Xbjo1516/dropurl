// /lib/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set in .env.local");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export type AiSummaryMeta = {
  urls: string[];
  has404: boolean;
  hasDuplicate: boolean;
  hasSeoIssues: boolean;
};

export async function summarizeWithAI(
  meta: AiSummaryMeta,
  lang: "th" | "en" = "th"
): Promise<string> {
  if (!genAI) {
    return lang === "th"
      ? "ไม่สามารถเรียกใช้ AI ได้ (ยังไม่ได้ตั้งค่า GEMINI_API_KEY)"
      : "AI is not available (GEMINI_API_KEY is not configured).";
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const promptTh = `
คุณคือผู้ช่วยด้านการตรวจสอบเว็บไซต์และ SEO
ระบบได้ตรวจสอบ URL ดังนี้:
- URLs: ${meta.urls.join(", ")}

สรุปสถานะรวม:
- มีปัญหา 404 หรือไม่: ${meta.has404 ? "มี" : "ไม่มี"}
- มีปัญหาลิงก์ซ้ำ (Duplicate) หรือไม่: ${
    meta.hasDuplicate ? "มี" : "ไม่มี"
  }
- มีปัญหา SEO เบื้องต้นหรือไม่: ${meta.hasSeoIssues ? "มี" : "ไม่มี"}

ให้คุณ:
1) สรุปผลแบบอ่านเข้าใจง่ายไม่เกิน 4–6 บรรทัด
2) ถ้ามีปัญหา ให้ยกตัวอย่างแนวทางแก้ไขแบบสั้น ๆ
3) ใช้ภาษาที่เป็นมิตร และเหมาะกับผู้ใช้ทั่วไป (ไม่ต้องเทคนิคเกินไป)
ตอบเป็นภาษาไทยเท่านั้น
`;

  const promptEn = `
You are an assistant specialized in website and SEO checks.
The system has scanned the following URLs:
- URLs: ${meta.urls.join(", ")}

Overall status:
- Any 404 issues: ${meta.has404 ? "Yes" : "No"}
- Any duplicate link issues: ${meta.hasDuplicate ? "Yes" : "No"}
- Any basic SEO issues: ${meta.hasSeoIssues ? "Yes" : "No"}

Please:
1) Summarize the results in 4–6 short lines.
2) If there are issues, suggest brief, practical fixes.
3) Use friendly, non-technical language.

Reply in English only.
`;

  const prompt = lang === "th" ? promptTh : promptEn;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return text.trim();
}
