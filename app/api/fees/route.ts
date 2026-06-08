import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { fees, students } from "@/db/schema";
import { eq, and, ilike } from "drizzle-orm";
import { createFeeSchema } from "@/lib/validations/fee";
import { getSchoolId } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ?? "";
    const month = searchParams.get("month") ?? "";
    const year = searchParams.get("year") ?? "";
    const status = searchParams.get("status") ?? "";
    const search = searchParams.get("search") ?? "";

    const conditions = [eq(fees.schoolId, schoolId)];

    if (month) conditions.push(eq(fees.month, parseInt(month)));
    if (year) conditions.push(eq(fees.year, parseInt(year)));
    if (status) conditions.push(eq(fees.status, status as "pending" | "paid" | "partial" | "overdue"));
    if (classId) conditions.push(eq(students.classId, classId));
    if (search) conditions.push(ilike(students.name, `%${search}%`));

    const result = await db
      .select({
        id: fees.id,
        studentId: fees.studentId,
        schoolId: fees.schoolId,
        month: fees.month,
        year: fees.year,
        amount: fees.amount,
        paidAmount: fees.paidAmount,
        status: fees.status,
        dueDate: fees.dueDate,
        paymentDate: fees.paymentDate,
        receiptNo: fees.receiptNo,
        createdAt: fees.createdAt,
        student: {
          id: students.id,
          name: students.name,
          rollNo: students.rollNo,
          classId: students.classId,
        },
      })
      .from(fees)
      .leftJoin(students, eq(fees.studentId, students.id))
      .where(and(...conditions))
      .orderBy(fees.createdAt);

    const totalAmount = result.reduce((sum, f) => sum + Number(f.amount), 0);
    const collectedAmount = result.reduce((sum, f) => sum + Number(f.paidAmount ?? 0), 0);

    return NextResponse.json({
      fees: result,
      summary: {
        total: result.length,
        paid: result.filter((f) => f.status === "paid").length,
        pending: result.filter((f) => f.status === "pending").length,
        overdue: result.filter((f) => f.status === "overdue").length,
        partial: result.filter((f) => f.status === "partial").length,
        totalAmount,
        collectedAmount,
        pendingAmount: totalAmount - collectedAmount,
      },
    });
  } catch (error) {
    console.error("[FEES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = createFeeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { studentId, month, year, amount, dueDate } = validated.data;

    const student = await db.query.students.findFirst({
      where: and(eq(students.id, studentId), eq(students.schoolId, schoolId)),
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const existing = await db.query.fees.findFirst({
      where: and(eq(fees.studentId, studentId), eq(fees.month, month), eq(fees.year, year)),
    });
    if (existing) return NextResponse.json({ error: "Is student ki is month ki fee pehle se exist karti hai" }, { status: 409 });

    const [fee] = await db
      .insert(fees)
      .values({ studentId, schoolId, month, year, amount: String(amount), dueDate: dueDate || null, status: "pending" })
      .returning();

    return NextResponse.json({ fee }, { status: 201 });
  } catch (error) {
    console.error("[FEES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}