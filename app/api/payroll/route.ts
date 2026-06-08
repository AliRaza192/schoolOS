import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff, users, salaryStructure, salaryPayments } from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { processPayrollSchema } from "@/lib/validations/hr";
import { calculateSalaryStructure, calculatePayableAmount, generatePayslipNumber } from "@/lib/payroll";


// GET — list salary payments for a month
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const status = searchParams.get("status");

    const conditions = [
      eq(salaryPayments.schoolId, schoolId),
      eq(salaryPayments.month, month),
      eq(salaryPayments.year, year),
    ];

    if (status) conditions.push(eq(salaryPayments.status, status as "pending" | "paid"));

    const payments = await db.query.salaryPayments.findMany({
      where: and(...conditions),
      with: { staff: true },
      orderBy: desc(salaryPayments.createdAt),
    });

    // Summary
    const totalPayable = payments.reduce((sum, p) => sum + Number(p.finalPayable), 0);
    const paidAmount = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.finalPayable), 0);
    const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.finalPayable), 0);

    return NextResponse.json({
      payments,
      summary: {
        totalStaff: payments.length,
        paidCount: payments.filter((p) => p.status === "paid").length,
        pendingCount: payments.filter((p) => p.status === "pending").length,
        totalPayable: Math.round(totalPayable),
        paidAmount: Math.round(paidAmount),
        pendingAmount: Math.round(pendingAmount),
      },
      month,
      year,
    });
  } catch (error) {
    console.error("[PAYROLL_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — process payroll for a month
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = processPayrollSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { month, year, staffIds, workingDays } = validated.data;

    // Get active staff
    const staffConditions = [eq(staff.schoolId, schoolId), eq(staff.isActive, true)];
    if (staffIds && staffIds.length > 0) {
      // Process only selected staff
    }

    const activeStaff = await db.query.staff.findMany({
      where: and(...staffConditions),
    });

    const processed: { staffId: string; staffName: string; finalPayable: number }[] = [];

    for (const member of activeStaff) {
      // Get latest salary structure
      const latestStructure = await db.query.salaryStructure.findFirst({
        where: eq(salaryStructure.staffId, member.id),
        orderBy: desc(salaryStructure.effectiveFrom),
      });

      if (!latestStructure) continue;

      const netSalary = Number(latestStructure.netSalary);

      // For now, assume all present (attendance integration can be added later)
      const presentDays = workingDays;
      const absentDays = 0;
      const leaveDays = 0;

      const payable = calculatePayableAmount(netSalary, workingDays, presentDays, leaveDays);

      // Upsert salary payment
      const existing = await db.query.salaryPayments.findFirst({
        where: and(
          eq(salaryPayments.staffId, member.id),
          eq(salaryPayments.month, month),
          eq(salaryPayments.year, year)
        ),
      });

      if (existing) {
        // Update existing
        await db
          .update(salaryPayments)
          .set({
            basicSalary: latestStructure.basicSalary,
            totalAllowances: String(
              Number(latestStructure.houseRent) +
              Number(latestStructure.medicalAllowance) +
              Number(latestStructure.transportAllowance) +
              Number(latestStructure.otherAllowances)
            ),
            totalDeductions: String(
              Number(latestStructure.providentFund) +
              Number(latestStructure.incomeTax) +
              Number(latestStructure.otherDeductions)
            ),
            grossSalary: latestStructure.grossSalary!,
            netSalary: latestStructure.netSalary!,
            presentDays,
            absentDays,
            leaveDays,
            workingDays,
            perDaySalary: String(payable.perDaySalary),
            deductionForAbsent: String(payable.deductionForAbsent),
            finalPayable: String(payable.finalPayable),
          })
          .where(eq(salaryPayments.id, existing.id));
      } else {
        // Insert new
        await db.insert(salaryPayments).values({
          staffId: member.id,
          schoolId,
          month,
          year,
          basicSalary: latestStructure.basicSalary,
          totalAllowances: String(
            Number(latestStructure.houseRent) +
            Number(latestStructure.medicalAllowance) +
            Number(latestStructure.transportAllowance) +
            Number(latestStructure.otherAllowances)
          ),
          totalDeductions: String(
            Number(latestStructure.providentFund) +
            Number(latestStructure.incomeTax) +
            Number(latestStructure.otherDeductions)
          ),
          grossSalary: latestStructure.grossSalary!,
          netSalary: latestStructure.netSalary!,
          presentDays,
          absentDays,
          leaveDays,
          workingDays,
          perDaySalary: String(payable.perDaySalary),
          deductionForAbsent: String(payable.deductionForAbsent),
          finalPayable: String(payable.finalPayable),
          status: "pending",
        });
      }

      processed.push({
        staffId: member.id,
        staffName: member.name,
        finalPayable: payable.finalPayable,
      });
    }

    const totalPayable = processed.reduce((sum, p) => sum + p.finalPayable, 0);

    return NextResponse.json({
      success: true,
      processed: processed.length,
      totalPayable: Math.round(totalPayable),
      breakdown: processed,
    });
  } catch (error) {
    console.error("[PAYROLL_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
