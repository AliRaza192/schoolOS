import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { leaveRequests, leaveBalances, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { approveLeaveSchema } from "@/lib/validations/hr";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// POST — approve or reject leave request
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (currentUser?.role !== "school_admin") {
      return NextResponse.json({ error: "Sirf school admin leave approve kar sakta hai" }, { status: 403 });
    }

    const { id } = await params;

    const leave = await db.query.leaveRequests.findFirst({
      where: and(eq(leaveRequests.id, id), eq(leaveRequests.schoolId, schoolId)),
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (leave.status !== "pending") {
      return NextResponse.json({ error: "Yeh leave request already process ho chuki hai" }, { status: 400 });
    }

    const body = await req.json();
    const validated = approveLeaveSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { action, remarks } = validated.data;

    const newStatus = action === "approve" ? "approved" : "rejected";

    const result = await db
      .update(leaveRequests)
      .set({
        status: newStatus,
        approvedByUserId: currentUser.id,
        approvedAt: new Date(),
        remarks: remarks || null,
      })
      .where(eq(leaveRequests.id, id))
      .returning() as unknown as typeof leaveRequests.$inferSelect[];

    // If approved, update leave balance
    if (action === "approve") {
      const currentYear = new Date().getFullYear();
      const balance = await db.query.leaveBalances.findFirst({
        where: and(
          eq(leaveBalances.staffId, leave.staffId),
          eq(leaveBalances.year, currentYear)
        ),
      });

      if (balance && leave.leaveType !== "unpaid") {
        const usedField = `${leave.leaveType}LeaveUsed` as keyof typeof balance;
        const currentUsed = (balance[usedField] as number) ?? 0;

        await db
          .update(leaveBalances)
          .set({ [usedField]: currentUsed + leave.totalDays })
          .where(eq(leaveBalances.id, balance.id));
      }
    }

    return NextResponse.json({ leave: result[0] });
  } catch (error) {
    console.error("[LEAVE_APPROVE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
