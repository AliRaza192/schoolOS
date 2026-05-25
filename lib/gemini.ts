import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY ?? "";

if (!apiKey) {
  console.warn("[GEMINI] GEMINI_API_KEY not set - AI features will use fallback");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface ReportCardParams {
  studentName: string;
  className: string;
  month: string;
  attendancePercentage: number;
  presentDays: number;
  totalDays: number;
  paidFees: boolean;
  teacherNote?: string;
}

export async function generateReportCard(
  params: ReportCardParams
): Promise<string> {
  const {
    studentName,
    className,
    month,
    attendancePercentage,
    presentDays,
    totalDays,
    paidFees,
    teacherNote,
  } = params;

  const fallback = `${studentName} has shown dedication this month with ${attendancePercentage}% attendance. We encourage continued effort and regular attendance.`;

  try {
    const prompt = `You are a professional school teacher writing a student report card comment for a Pakistani school. Write a brief, encouraging, and professional comment in English (2-3 sentences) for the following student:

Student: ${studentName}
Class: ${className}
Month: ${month}
Attendance: ${attendancePercentage}% (${presentDays}/${totalDays} days)
Fee Status: ${paidFees ? "Paid" : "Pending"}
Teacher Note: ${teacherNote || "None"}

Guidelines:
- Be positive and encouraging even for low attendance
- Mention attendance specifically
- If attendance < 75%, suggest improvement gently
- Keep it professional and suitable for Pakistani parents
- Do NOT mention fee status in the comment
- 2-3 sentences only

Return ONLY the comment text, nothing else.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || fallback;
  } catch (error) {
    console.error("[GEMINI_ERROR]", error);
    return fallback;
  }
}