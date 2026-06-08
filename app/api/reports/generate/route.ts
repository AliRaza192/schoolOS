import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, students, classes, attendance, fees } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";
import { generateReportSchema } from "@/lib/validations/report-card";
import { generateReportCard } from "@/lib/gemini";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// 4 second delay between batches for Gemini rate limiting
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      with: { school: true },
    });

    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = generateReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { classId, month, year, teacherNote } = validated.data;

    // Verify class
    const classRecord = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.schoolId, user.schoolId)),
    });

    if (!classRecord) return NextResponse.json({ error: "Class not found" }, { status: 404 });

    // Fetch active students
    const classStudents = await db.query.students.findMany({
      where: and(
        eq(students.classId, classId),
        eq(students.schoolId, user.schoolId),
        eq(students.isActive, true)
      ),
      orderBy: students.rollNo,
    });

    if (classStudents.length === 0) {
      return NextResponse.json({ error: "Is class mein koi student nahi" }, { status: 400 });
    }

    // Date range for month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const monthName = MONTHS[month - 1];

    // Fetch all attendance for this class+month
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        eq(attendance.classId, classId),
        eq(attendance.schoolId, user.schoolId),
        between(attendance.date, startDate, endDate)
      ),
    });

    // Fetch all fees for this class+month
    const feeRecords = await db.query.fees.findMany({
      where: and(
        eq(fees.schoolId, user.schoolId),
        eq(fees.month, month),
        eq(fees.year, year)
      ),
    });

    const uniqueDates = [...new Set(attendanceRecords.map((a) => a.date))];
    const totalDays = uniqueDates.length;

    // Process in batches of 10 — Gemini free tier 15 req/min
    const BATCH_SIZE = 10;
    const reports = [];

    for (let i = 0; i < classStudents.length; i += BATCH_SIZE) {
      const batch = classStudents.slice(i, i + BATCH_SIZE);

      const batchReports = await Promise.all(
        batch.map(async (student) => {
          const studentAttendance = attendanceRecords.filter(
            (a) => a.studentId === student.id
          );
          const presentDays = studentAttendance.filter(
            (a) => a.status === "present"
          ).length;
          const attendancePercentage =
            totalDays > 0
              ? Math.round((presentDays / totalDays) * 100)
              : 0;

          const studentFee = feeRecords.find(
            (f) => f.studentId === student.id
          );
          const paidFees = studentFee?.status === "paid";

          const className = `${classRecord.name}${classRecord.section ? ` (${classRecord.section})` : ""}`;

          const aiComment = await generateReportCard({
            studentName: student.name,
            className,
            month: `${monthName} ${year}`,
            attendancePercentage,
            presentDays,
            totalDays,
            paidFees,
            teacherNote: teacherNote || undefined,
          });

          return {
            studentId: student.id,
            studentName: student.name,
            fatherName: student.fatherName,
            rollNo: student.rollNo,
            attendancePercentage,
            presentDays,
            absentDays: studentAttendance.filter((a) => a.status === "absent").length,
            leaveDays: studentAttendance.filter((a) => a.status === "leave").length,
            totalDays,
            feeStatus: studentFee?.status ?? "no_record",
            paidFees,
            aiComment,
            month,
            year,
          };
        })
      );

      reports.push(...batchReports);

      // Delay between batches (except last)
      if (i + BATCH_SIZE < classStudents.length) {
        await delay(4000);
      }
    }

    return NextResponse.json({
      success: true,
      reports,
      totalProcessed: reports.length,
      monthName,
      className: `${classRecord.name}${classRecord.section ? ` (${classRecord.section})` : ""}`,
      schoolName: user.school?.name ?? "School",
    });
  } catch (error) {
    console.error("[REPORTS_GENERATE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}