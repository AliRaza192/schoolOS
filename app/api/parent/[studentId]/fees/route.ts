import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, parentStudents, fees } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    const feeRecords = await db.query.fees.findMany({
      where: eq(fees.studentId, studentId),
      orderBy: [desc(fees.year), desc(fees.month)],
    });

    const totalPaid = feeRecords.reduce(
      (sum, f) => sum + Number(f.paidAmount ?? 0), 0
    );
    const totalPending = feeRecords
      .filter((f) => f.status !== "paid")
      .reduce((sum, f) => sum + (Number(f.amount) - Number(f.paidAmount ?? 0)), 0);

    return NextResponse.json({
      fees: feeRecords,
      summary: { totalPaid, totalPending, total: feeRecords.length },
    });
  } catch (error) {
    console.error("[PARENT_FEES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}