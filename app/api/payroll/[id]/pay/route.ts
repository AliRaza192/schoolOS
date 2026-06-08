import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { salaryPayments, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePayslipNumber } from "@/lib/payroll";


// POST — mark salary as paid
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    const payment = await db.query.salaryPayments.findFirst({
      where: and(eq(salaryPayments.id, id), eq(salaryPayments.schoolId, schoolId)),
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const body = await req.json();
    const { paymentMethod, remarks } = body;

    const payslipNo = generatePayslipNumber();

    const result = await db
      .update(salaryPayments)
      .set({
        status: "paid",
        paidAt: new Date(),
        paymentMethod: paymentMethod || null,
        remarks: remarks || null,
        payslipNo,
      })
      .where(eq(salaryPayments.id, id))
      .returning() as unknown as typeof salaryPayments.$inferSelect[];

    return NextResponse.json({ payment: result[0] });
  } catch (error) {
    console.error("[PAYROLL_PAY_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
