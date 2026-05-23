import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, students, attendance, fees, classes } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const schoolId = user.schoolId;
    const today = new Date().toISOString().split("T")[0];

    const [
      totalStudentsResult,
      presentCountResult,
      totalMarkedResult,
      pendingFeesResult,
      totalClassesResult,
    ] = await Promise.all([
      // Total active students
      db
        .select({ count: count() })
        .from(students)
        .where(
          and(
            eq(students.schoolId, schoolId),
            eq(students.isActive, true)
          )
        ),

      // Today present count
      db
        .select({ count: count() })
        .from(attendance)
        .where(
          and(
            eq(attendance.schoolId, schoolId),
            eq(attendance.date, today),
            eq(attendance.status, "present")
          )
        ),

      // Today total marked
      db
        .select({ count: count() })
        .from(attendance)
        .where(
          and(
            eq(attendance.schoolId, schoolId),
            eq(attendance.date, today)
          )
        ),

      // Pending + overdue fees
      db
        .select({ count: count() })
        .from(fees)
        .where(
          and(
            eq(fees.schoolId, schoolId),
            eq(fees.status, "pending")
          )
        ),

      // Active classes
      db
        .select({ count: count() })
        .from(classes)
        .where(
          and(
            eq(classes.schoolId, schoolId),
            eq(classes.isActive, true)
          )
        ),
    ]);

    const totalStudents = totalStudentsResult[0]?.count ?? 0;
    const presentCount = presentCountResult[0]?.count ?? 0;
    const totalMarked = totalMarkedResult[0]?.count ?? 0;
    const pendingFees = pendingFeesResult[0]?.count ?? 0;
    const totalClasses = totalClassesResult[0]?.count ?? 0;

    const percentage =
      totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    return NextResponse.json({
      totalStudents,
      todayAttendance: {
        presentCount,
        totalMarked,
        percentage,
      },
      pendingFees,
      totalClasses,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}