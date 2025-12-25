// /lib/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set in environment");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export type IssueDetail = {
  type: "404" | "duplicate" | "seo";
  urls: string[];
  note?: string;
};

export type AiSummaryMeta = {
  urls: string[];
  has404: boolean;
  hasDuplicate: boolean;
  hasSeoIssues: boolean;
  issueDetails?: IssueDetail[];
};

export async function summarizeWithAI(
  meta: AiSummaryMeta,
  lang: "th" | "en" = "th"
): Promise<string> {
  // Fallback message
  const fallback =
    lang === "th"
      ? "ไม่สามารถสรุปผลด้วย AI ได้ในขณะนี้"
      : "AI summary is not available at the moment.";

  if (!genAI) {
    return lang === "th"
      ? "ไม่สามารถเรียกใช้ AI ได้ (ยังไม่ได้ตั้งค่า GEMINI_API_KEY)"
      : "AI is not available (GEMINI_API_KEY is not configured).";
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const promptTh = `
คุณคือผู้ช่วยด้านการตรวจสอบเว็บไซต์และ SEO
ระบบได้ตรวจสอบ URL ดังนี้:
- URLs: ${meta.urls.join(", ")}

สรุปสถานะรวม:
- มีปัญหา 404 หรือไม่: ${meta.has404 ? "มี" : "ไม่มี"}
- มีปัญหาลิงก์ซ้ำ (Duplicate) หรือไม่: ${meta.hasDuplicate ? "มี" : "ไม่มี"
      }
- มีปัญหา SEO เบื้องต้นหรือไม่: ${meta.hasSeoIssues ? "มี" : "ไม่มี"}

${meta.issueDetails && meta.issueDetails.length > 0
        ? `
รายละเอียดปัญหาที่พบ:
${meta.issueDetails
          .map(
            (issue, index) => `
${index + 1}) ประเภทปัญหา: ${issue.type}
URL ที่ได้รับผลกระทบ:
${issue.urls.map((u) => `- ${u}`).join("\n")}
รายละเอียดเพิ่มเติม: ${issue.note ?? "-"}
`
          )
          .join("\n")}
`
        : ""
      }

ให้คุณตอบตามกติกานี้อย่างเคร่งครัด:

รูปแบบคำตอบ:
- ห้ามใช้เครื่องหมาย * หรือ -
- ห้ามใช้ bullet point ทุกชนิด
- ใช้ตัวเลข 1 2 3 เท่านั้น
- ใช้ประโยคสั้น อ่านง่าย
- ความยาวรวมไม่เกิน 8–10 บรรทัด
- เหมาะสำหรับแสดงผลใน Discord

โครงสร้างคำตอบ:
1) บทนำสั้นมาก ว่าเป็นสรุปจากผลการตรวจด้านบน
2) ระบุประเภทปัญหาที่พบ (ถ้าไม่มี ให้บอกว่าไม่พบ)
3) ระบุ URL ที่มีปัญหา
4) คำแนะนำในการแก้ไข แบ่งเป็นข้อ 1 2 3

ตอบเป็นภาษาไทยเท่านั้น
`;

    const promptEn = `
You are an assistant specialized in website and SEO checks.

The system has scanned the following URLs:
${meta.urls.join("\n")}

Overall status:
    - Any 404 issues: ${meta.has404 ? "Yes" : "No"}
    - Any duplicate link issues: ${meta.hasDuplicate ? "Yes" : "No"}
    - Any basic SEO issues: ${meta.hasSeoIssues ? "Yes" : "No"}

${meta.issueDetails && meta.issueDetails.length > 0
        ? `
Detailed issues found:
${meta.issueDetails
          .map(
            (issue, index) => `
${index + 1}) Issue type: ${issue.type}
Affected URLs:
${issue.urls.map((u) => `- ${u}`).join("\n")}
Additional note: ${issue.note ?? "-"}
`
          )
          .join("\n")}
`
        : ""
      }

Follow these rules strictly:

Formatting rules:
- Do NOT use * or -
- Do NOT use bullet points
- Use numbered lists only (1 2 3)
- Short, clear sentences
- Max 8–10 lines total
- Discord-friendly

Response structure:
1) Very short intro saying this is a summary from the results above
2) Issue types found (or say none found)
3) Affected URLs
4) Fix suggestions as numbered steps

Reply in English only.
`;

    const prompt = lang === "th" ? promptTh : promptEn;

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (!text) return fallback;
    return text;
  } catch (err) {
    console.error("summarizeWithAI error:", err);
    return fallback;
  }
}
