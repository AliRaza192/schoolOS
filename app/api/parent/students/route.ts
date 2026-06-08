import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, parentStudents, attendance, fees } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const links = await db.query.parentStudents.findMany({
      where: eq(parentStudents.parentUserId, user.id),
      with: {
        student: { with: { class: true } },
      },
    });

    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const children = await Promise.all(
      links.map(async (link) => {
        const studentData = link.student as { id: string; name: string; rollNo: string | null; classId: string; fatherName: string | null; class?: { name?: string; section?: string } };
        const student = studentData;
        const studentClass = studentData.class;

        const [todayAttendance, currentFee, weekAttendance] = await Promise.all([
          db.query.attendance.findFirst({
            where: and(
              eq(attendance.studentId, student.id),
              eq(attendance.date, today)
            ),
          }),
          db.query.fees.findFirst({
            where: and(
              eq(fees.studentId, student.id),
              eq(fees.month, currentMonth),
              eq(fees.year, currentYear)
            ),
          }),
          db.query.attendance.findMany({
            where: and(
              eq(attendance.studentId, student.id)
            ),
          }),
        ]);

        const weekRecords = last7Days.map((date) => {
          const record = weekAttendance.find((a) => a.date === date);
          return { date, status: record?.status ?? null };
        });

        return {
          studentId: student.id,
          name: student.name,
          fatherName: student.fatherName,
          rollNo: student.rollNo,
          class: studentClass
            ? `${studentClass.name ?? ""}${studentClass.section ? ` (${studentClass.section})` : ""}`
            : "—",
          todayAttendance: todayAttendance?.status ?? null,
          feeStatus: currentFee?.status ?? null,
          last7Days: weekRecords,
        };
      })
    );

    return NextResponse.json({ children });
  } catch (error) {
    console.error("[PARENT_STUDENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}