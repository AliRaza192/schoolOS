import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, students, classes, users } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user?.schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const month = parseInt(searchParams.get("month") ?? "0");
    const year = parseInt(searchParams.get("year") ?? "0");

    if (!classId || !month || !year) {
      return NextResponse.json(
        { error: "classId, month aur year required hain" },
        { status: 400 }
      );
    }

    // Verify class
    const classRecord = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, classId),
        eq(classes.schoolId, user.schoolId)
      ),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Date range for the month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    // Fetch students
    const classStudents = await db.query.students.findMany({
      where: and(
        eq(students.classId, classId),
        eq(students.schoolId, user.schoolId),
        eq(students.isActive, true)
      ),
      orderBy: students.rollNo,
    });

    // Fetch all attendance for this month
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        eq(attendance.classId, classId),
        eq(attendance.schoolId, user.schoolId),
        between(attendance.date, startDate, endDate)
      ),
    });

    // Get unique working days
    const uniqueDates = [...new Set(attendanceRecords.map((a) => a.date))];
    const workingDays = uniqueDates.length;

    // Build report per student
    const studentReports = classStudents.map((student) => {
      const records = attendanceRecords.filter(
        (a) => a.studentId === student.id
      );
      const present = records.filter((a) => a.status === "present").length;
      const absent = records.filter((a) => a.status === "absent").length;
      const leave = records.filter((a) => a.status === "leave").length;
      const totalDays = present + absent + leave;
      const percentage =
        workingDays > 0
          ? Math.round((present / workingDays) * 1000) / 10
          : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        present,
        absent,
        leave,
        totalDays,
        percentage,
      };
    });

    return NextResponse.json({
      students: studentReports,
      workingDays,
      month,
      year,
      className: `${classRecord.name}${classRecord.section ? ` (${classRecord.section})` : ""}`,
    });
  } catch (error) {
    console.error("[ATTENDANCE_REPORT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}