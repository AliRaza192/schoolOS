import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { leaveRequests, leaveBalances, staff, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { leaveRequestSchema } from "@/lib/validations/hr";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — list leave requests
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");

    const conditions = [eq(leaveRequests.schoolId, schoolId)];
    if (staffId) conditions.push(eq(leaveRequests.staffId, staffId));
    if (status) conditions.push(eq(leaveRequests.status, status as "pending" | "approved" | "rejected"));

    const requests = await db.query.leaveRequests.findMany({
      where: and(...conditions),
      with: { staff: true },
      orderBy: desc(leaveRequests.createdAt),
    });

    return NextResponse.json({ leaves: requests });
  } catch (error) {
    console.error("[LEAVES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — submit leave request
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = leaveRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { staffId, leaveType, fromDate, toDate, reason } = validated.data;

    // Verify staff belongs to school
    const member = await db.query.staff.findFirst({
      where: and(eq(staff.id, staffId), eq(staff.schoolId, schoolId)),
    });

    if (!member) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Calculate total days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const totalDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await db.query.leaveBalances.findFirst({
      where: and(eq(leaveBalances.staffId, staffId), eq(leaveBalances.year, currentYear)),
    });

    if (balance && leaveType !== "unpaid") {
      const totalField = `${leaveType}LeaveTotal` as keyof typeof balance;
      const usedField = `${leaveType}LeaveUsed` as keyof typeof balance;
      const remaining = (balance[totalField] as number) - (balance[usedField] as number);

      if (totalDays > remaining) {
        return NextResponse.json(
          { error: `${leaveType} leave balance nahi hai. Remaining: ${remaining} days` },
          { status: 400 }
        );
      }
    }

    const result = await db
      .insert(leaveRequests)
      .values({
        staffId,
        schoolId,
        leaveType,
        fromDate,
        toDate,
        totalDays,
        reason: reason || null,
        status: "pending",
      })
      .returning() as unknown as typeof leaveRequests.$inferSelect[];

    return NextResponse.json({ leave: result[0] }, { status: 201 });
  } catch (error) {
    console.error("[LEAVES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
