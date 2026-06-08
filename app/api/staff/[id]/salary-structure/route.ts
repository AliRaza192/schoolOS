import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff, users, salaryStructure } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { salaryStructureSchema } from "@/lib/validations/hr";
import { calculateSalaryStructure } from "@/lib/payroll";


// GET — salary structure history
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

    const structures = await db.query.salaryStructure.findMany({
      where: eq(salaryStructure.staffId, id),
      orderBy: desc(salaryStructure.effectiveFrom),
    });

    return NextResponse.json({ structures });
  } catch (error) {
    console.error("[SALARY_STRUCTURE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create/update salary structure
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

    const member = await db.query.staff.findFirst({
      where: and(eq(staff.id, id), eq(staff.schoolId, schoolId)),
    });

    if (!member) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = salaryStructureSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const data = validated.data;
    const calculated = calculateSalaryStructure({
      basicSalary: data.basicSalary,
      houseRent: data.houseRent ?? 0,
      medicalAllowance: data.medicalAllowance ?? 0,
      transportAllowance: data.transportAllowance ?? 0,
      otherAllowances: data.otherAllowances ?? 0,
      providentFund: data.providentFund ?? 0,
      incomeTax: data.incomeTax ?? 0,
      otherDeductions: data.otherDeductions ?? 0,
    });

    const result = await db
      .insert(salaryStructure)
      .values({
        staffId: id,
        schoolId,
        basicSalary: String(data.basicSalary),
        houseRent: String(data.houseRent ?? 0),
        medicalAllowance: String(data.medicalAllowance ?? 0),
        transportAllowance: String(data.transportAllowance ?? 0),
        otherAllowances: String(data.otherAllowances ?? 0),
        providentFund: String(data.providentFund ?? 0),
        incomeTax: String(data.incomeTax ?? 0),
        otherDeductions: String(data.otherDeductions ?? 0),
        grossSalary: String(calculated.grossSalary),
        netSalary: String(calculated.netSalary),
        effectiveFrom: data.effectiveFrom,
      })
      .returning() as unknown as typeof salaryStructure.$inferSelect[];

    return NextResponse.json({ structure: result[0] }, { status: 201 });
  } catch (error) {
    console.error("[SALARY_STRUCTURE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
