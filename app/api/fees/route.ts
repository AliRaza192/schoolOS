import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { fees, students, classes, users } from "@/db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { createFeeSchema } from "@/lib/validations/fee";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

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

    const result = await db.query.fees.findMany({
      where: and(...conditions),
      with: {
        student: {
          with: { class: true },
        },
      },
      orderBy: fees.createdAt,
    });

    // Filter by classId and search after join
    let filtered = result;
    if (classId) {
      filtered = filtered.filter((f) => f.student?.classId === classId);
    }
    if (search) {
      filtered = filtered.filter((f) =>
        f.student?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Summary
    const totalAmount = filtered.reduce((sum, f) => sum + Number(f.amount), 0);
    const collectedAmount = filtered.reduce(
      (sum, f) => sum + Number(f.paidAmount ?? 0),
      0
    );

    return NextResponse.json({
      fees: filtered,
      summary: {
        total: filtered.length,
        paid: filtered.filter((f) => f.status === "paid").length,
        pending: filtered.filter((f) => f.status === "pending").length,
        overdue: filtered.filter((f) => f.status === "overdue").length,
        partial: filtered.filter((f) => f.status === "partial").length,
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
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { studentId, month, year, amount, dueDate } = validated.data;

    const student = await db.query.students.findFirst({
      where: and(eq(students.id, studentId), eq(students.schoolId, schoolId)),
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const existing = await db.query.fees.findFirst({
      where: and(
        eq(fees.studentId, studentId),
        eq(fees.month, month),
        eq(fees.year, year)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Is student ki is month ki fee pehle se exist karti hai" },
        { status: 409 }
      );
    }

    const [fee] = await db
      .insert(fees)
      .values({
        studentId,
        schoolId,
        month,
        year,
        amount: String(amount),
        dueDate: dueDate || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ fee }, { status: 201 });
  } catch (error) {
    console.error("[FEES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}