import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, parentStudents, attendance } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await params;

    // Verify link
    const link = await db.query.parentStudents.findFirst({
      where: and(
        eq(parentStudents.parentUserId, user.id),
        eq(parentStudents.studentId, studentId)
      ),
    });

    if (!link) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const records = await db.query.attendance.findMany({
      where: and(
        eq(attendance.studentId, studentId),
        between(attendance.date, startDate, endDate)
      ),
      orderBy: attendance.date,
    });

    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const leave = records.filter((r) => r.status === "leave").length;
    const percentage = records.length > 0
      ? Math.round((present / records.length) * 100)
      : 0;

    return NextResponse.json({
      records,
      summary: { present, absent, leave, total: records.length, percentage },
      month,
      year,
    });
  } catch (error) {
    console.error("[PARENT_ATTENDANCE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}