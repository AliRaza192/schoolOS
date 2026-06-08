import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { salaryPayments, staff, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";


// GET — export payroll as CSV
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

    const payments = await db.query.salaryPayments.findMany({
      where: and(
        eq(salaryPayments.schoolId, schoolId),
        eq(salaryPayments.month, month),
        eq(salaryPayments.year, year),
        eq(salaryPayments.status, "pending")
      ),
      with: { staff: true },
    });

    // Generate CSV
    const header = "Employee Code,Employee Name,Designation,Basic Salary,Allowances,Deductions,Net Salary,Absent Deduction,Final Payable,Status";
    const rows = payments.map((p) => {
      const s = p.staff;
      return [
        s.employeeCode,
        `"${s.name}"`,
        `"${s.designation}"`,
        p.basicSalary,
        p.totalAllowances,
        p.totalDeductions,
        p.netSalary,
        p.deductionForAbsent,
        p.finalPayable,
        p.status,
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=payroll-${year}-${String(month).padStart(2, "0")}.csv`,
      },
    });
  } catch (error) {
    console.error("[PAYROLL_EXPORT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
