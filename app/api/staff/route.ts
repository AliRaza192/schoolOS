import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { staff, users, leaveBalances } from "@/db/schema";
import { eq, and, count, like, or } from "drizzle-orm";
import { createStaffSchema } from "@/lib/validations/hr";
import { generateEmployeeCode } from "@/lib/payroll";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — list all staff
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const designation = searchParams.get("designation");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const conditions = [eq(staff.schoolId, schoolId)];

    if (branchId) conditions.push(eq(staff.branchId, branchId));
    if (designation) conditions.push(eq(staff.designation, designation));
    if (isActive !== null) conditions.push(eq(staff.isActive, isActive !== "false"));
    if (search) {
      conditions.push(
        or(
          like(staff.name, `%${search}%`),
          like(staff.employeeCode, `%${search}%`)
        )!
      );
    }

    const result = await db.query.staff.findMany({
      where: and(...conditions),
      orderBy: staff.name,
    });

    const [totalResult] = await db
      .select({ count: count() })
      .from(staff)
      .where(eq(staff.schoolId, schoolId));

    return NextResponse.json({
      staff: result,
      total: totalResult?.count ?? 0,
    });
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create new staff member
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (currentUser?.role !== "school_admin") {
      return NextResponse.json({ error: "Sirf school admin staff add kar sakta hai" }, { status: 403 });
    }

    const body = await req.json();
    const validated = createStaffSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { name, fatherName, cnic, phone, designation, department, joiningDate, basicSalary, branchId } = validated.data;

    // Auto-generate employee code
    const [staffCount] = await db
      .select({ count: count() })
      .from(staff)
      .where(eq(staff.schoolId, schoolId));

    const employeeCode = generateEmployeeCode(staffCount?.count ?? 0);

    const result = await db
      .insert(staff)
      .values({
        schoolId,
        branchId: branchId || null,
        employeeCode,
        name,
        fatherName: fatherName || null,
        cnic: cnic || null,
        phone: phone || null,
        designation,
        department: department || null,
        joiningDate,
        basicSalary: String(basicSalary),
        isActive: true,
      })
      .returning() as unknown as typeof staff.$inferSelect[];

    // Create default leave balance for current year
    const currentYear = new Date().getFullYear();
    await db.insert(leaveBalances).values({
      staffId: result[0].id,
      schoolId,
      year: currentYear,
      sickLeaveTotal: 10,
      sickLeaveUsed: 0,
      casualLeaveTotal: 10,
      casualLeaveUsed: 0,
      annualLeaveTotal: 14,
      annualLeaveUsed: 0,
    });

    return NextResponse.json({ staff: result[0] }, { status: 201 });
  } catch (error) {
    console.error("[STAFF_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
