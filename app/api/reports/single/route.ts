import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, students, classes, attendance, fees } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";
import { singleReportSchema } from "@/lib/validations/report-card";
import { generateReportCard } from "@/lib/gemini";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
    const validated = singleReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { studentId, month, year, teacherNote } = validated.data;

    const student = await db.query.students.findFirst({
      where: and(
        eq(students.id, studentId),
        eq(students.schoolId, user.schoolId)
      ),
      with: { class: true },
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [attendanceRecords, feeRecord] = await Promise.all([
      db.query.attendance.findMany({
        where: and(
          eq(attendance.studentId, studentId),
          eq(attendance.schoolId, user.schoolId),
          between(attendance.date, startDate, endDate)
        ),
      }),
      db.query.fees.findFirst({
        where: and(
          eq(fees.studentId, studentId),
          eq(fees.schoolId, user.schoolId),
          eq(fees.month, month),
          eq(fees.year, year)
        ),
      }),
    ]);

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === "present").length;
    const attendancePercentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    const paidFees = feeRecord?.status === "paid";
    const studentClass = student.class as { name?: string; section?: string } | undefined;
    const className = studentClass
      ? `${studentClass.name ?? ""}${studentClass.section ? ` (${studentClass.section})` : ""}`
      : "N/A";

    const aiComment = await generateReportCard({
      studentName: student.name,
      className,
      month: `${MONTHS[month - 1]} ${year}`,
      attendancePercentage,
      presentDays,
      totalDays,
      paidFees,
      teacherNote: teacherNote || undefined,
    });

    return NextResponse.json({
      report: {
        studentId: student.id,
        studentName: student.name,
        fatherName: student.fatherName,
        rollNo: student.rollNo,
        attendancePercentage,
        presentDays,
        absentDays: attendanceRecords.filter((a) => a.status === "absent").length,
        leaveDays: attendanceRecords.filter((a) => a.status === "leave").length,
        totalDays,
        feeStatus: feeRecord?.status ?? "no_record",
        paidFees,
        aiComment,
        month,
        year,
      },
      monthName: MONTHS[month - 1],
      className,
      schoolName: user.school?.name ?? "School",
    });
  } catch (error) {
    console.error("[REPORTS_SINGLE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}