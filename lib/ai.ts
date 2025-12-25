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

ให้คุณ:
1) สรุปผลแบบอ่านเข้าใจง่ายไม่เกิน 4–6 บรรทัด
2) ระบุประเภทปัญหาที่พบทั้งหมด
3) บอกว่าแต่ละปัญหาเกิดกับ URL ใดบ้าง
4) แนะนำวิธีแก้ไขของแต่ละประเภทแบบสั้น ๆ
5) ใช้ภาษาที่เป็นมิตร และเหมาะกับผู้ใช้ทั่วไป

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

Please:
1) Summarize the overall results in 4–6 short, easy-to-read lines.
2) List all issue types that were found.
3) Clearly state which URLs are affected by each issue.
4) Provide brief, practical suggestions on how to fix each issue.
5) Use friendly, non-technical language suitable for general users.

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
