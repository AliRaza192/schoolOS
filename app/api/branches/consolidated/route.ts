import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches, classes, students, fees, attendance, users } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { checkPlanAccess } from "@/lib/plan-gate";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — consolidated report for all branches
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const access = await checkPlanAccess(schoolId, "academy");
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Academy plan required" }, { status: 403 });
    }

    // Get all active branches
    const allBranches = await db.query.branches.findMany({
      where: and(eq(branches.schoolId, schoolId), eq(branches.isActive, true)),
    });

    const today = new Date().toISOString().split("T")[0];

    // Get stats for each branch
    const branchStats = await Promise.all(
      allBranches.map(async (branch) => {
        // Student count
        const [studentCountResult] = await db
          .select({ count: count() })
          .from(students)
          .innerJoin(classes, eq(students.classId, classes.id))
          .where(and(eq(classes.branchId, branch.id), eq(students.isActive, true)));

        // Class count
        const [classCountResult] = await db
          .select({ count: count() })
          .from(classes)
          .where(and(eq(classes.branchId, branch.id), eq(classes.isActive, true)));

        // Today's attendance percentage
        const todayAttendance = await db
          .select({
            status: attendance.status,
            cnt: count(),
          })
          .from(attendance)
          .innerJoin(classes, eq(attendance.classId, classes.id))
          .where(and(eq(classes.branchId, branch.id), eq(attendance.date, today)))
          .groupBy(attendance.status);

        const totalMarked = todayAttendance.reduce((sum, r) => sum + r.cnt, 0);
        const presentCount = todayAttendance.find((r) => r.status === "present")?.cnt ?? 0;
        const attendancePercentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

        // Pending fees
        const [pendingFeesResult] = await db
          .select({ total: sql<string>`coalesce(sum(${fees.amount}), 0)` })
          .from(fees)
          .innerJoin(students, eq(fees.studentId, students.id))
          .innerJoin(classes, eq(students.classId, classes.id))
          .where(
            and(
              eq(classes.branchId, branch.id),
              eq(fees.status, "pending")
            )
          );

        // Collected this month
        const now = new Date();
        const [collectedResult] = await db
          .select({ total: sql<string>`coalesce(sum(${fees.paidAmount}), 0)` })
          .from(fees)
          .innerJoin(students, eq(fees.studentId, students.id))
          .innerJoin(classes, eq(students.classId, classes.id))
          .where(
            and(
              eq(classes.branchId, branch.id),
              eq(fees.status, "paid"),
              eq(fees.month, now.getMonth() + 1),
              eq(fees.year, now.getFullYear())
            )
          );

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.branchCode,
          students: studentCountResult?.count ?? 0,
          classes: classCountResult?.count ?? 0,
          todayAttendance: attendancePercentage,
          pendingFees: Number(pendingFeesResult?.total ?? 0),
          collectedThisMonth: Number(collectedResult?.total ?? 0),
        };
      })
    );

    // Totals
    const totalStudents = branchStats.reduce((sum, b) => sum + b.students, 0);
    const totalClasses = branchStats.reduce((sum, b) => sum + b.classes, 0);
    const totalPendingFees = branchStats.reduce((sum, b) => sum + b.pendingFees, 0);
    const totalCollectedFees = branchStats.reduce((sum, b) => sum + b.collectedThisMonth, 0);
    const avgAttendance =
      branchStats.length > 0
        ? Math.round(branchStats.reduce((sum, b) => sum + b.todayAttendance, 0) / branchStats.length)
        : 0;

    return NextResponse.json({
      totalStudents,
      totalClasses,
      totalPendingFees,
      totalCollectedFees,
      averageAttendance: avgAttendance,
      branches: branchStats,
    });
  } catch (error) {
    console.error("[BRANCHES_CONSOLIDATED_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
