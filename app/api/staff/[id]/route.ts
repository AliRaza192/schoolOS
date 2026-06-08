import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff, users, salaryStructure, salaryPayments, leaveBalances } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";


// GET — staff details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    const member = await db.query.staff.findFirst({
      where: and(eq(staff.id, id), eq(staff.schoolId, schoolId)),
    });

    if (!member) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Get latest salary structure
    const latestStructure = await db.query.salaryStructure.findFirst({
      where: eq(salaryStructure.staffId, id),
      orderBy: desc(salaryStructure.effectiveFrom),
    });

    // Get current month salary status
    const now = new Date();
    const currentPayment = await db.query.salaryPayments.findFirst({
      where: and(
        eq(salaryPayments.staffId, id),
        eq(salaryPayments.month, now.getMonth() + 1),
        eq(salaryPayments.year, now.getFullYear())
      ),
    });

    // Get leave balance
    const currentYear = now.getFullYear();
    const balance = await db.query.leaveBalances.findFirst({
      where: and(
        eq(leaveBalances.staffId, id),
        eq(leaveBalances.year, currentYear)
      ),
    });

    // Get last 3 months payment history
    const paymentHistory = await db.query.salaryPayments.findMany({
      where: eq(salaryPayments.staffId, id),
      orderBy: desc(salaryPayments.createdAt),
      limit: 3,
    });

    return NextResponse.json({
      staff: member,
      salaryStructure: latestStructure ?? null,
      currentMonthPayment: currentPayment ?? null,
      leaveBalance: balance ?? null,
      paymentHistory,
    });
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update staff info
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    const member = await db.query.staff.findFirst({
      where: and(eq(staff.id, id), eq(staff.schoolId, schoolId)),
    });

    if (!member) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, fatherName, cnic, phone, designation, department, branchId } = body;

    const result = await db
      .update(staff)
      .set({
        ...(name && { name }),
        ...(fatherName !== undefined && { fatherName: fatherName || null }),
        ...(cnic !== undefined && { cnic: cnic || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(designation && { designation }),
        ...(department !== undefined && { department: department || null }),
        ...(branchId !== undefined && { branchId: branchId || null }),
        updatedAt: new Date(),
      })
      .where(eq(staff.id, id))
      .returning() as unknown as typeof staff.$inferSelect[];

    return NextResponse.json({ staff: result[0] });
  } catch (error) {
    console.error("[STAFF_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — soft delete
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    const member = await db.query.staff.findFirst({
      where: and(eq(staff.id, id), eq(staff.schoolId, schoolId)),
    });

    if (!member) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    await db
      .update(staff)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(staff.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STAFF_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
