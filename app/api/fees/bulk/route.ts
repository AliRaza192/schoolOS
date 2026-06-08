import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { fees, students, classes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { bulkCreateFeeSchema } from "@/lib/validations/fee";


export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = bulkCreateFeeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { classId, month, year, amount, dueDate } = validated.data;

    const classRecord = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.schoolId, schoolId)),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const classStudents = await db.query.students.findMany({
      where: and(
        eq(students.classId, classId),
        eq(students.schoolId, schoolId),
        eq(students.isActive, true)
      ),
    });

    if (classStudents.length === 0) {
      return NextResponse.json(
        { error: "Is class mein koi student nahi" },
        { status: 400 }
      );
    }

    // Find existing fees
    const existingFees = await db.query.fees.findMany({
      where: and(eq(fees.month, month), eq(fees.year, year), eq(fees.schoolId, schoolId)),
    });

    const existingStudentIds = new Set(existingFees.map((f) => f.studentId));
    const newStudents = classStudents.filter((s) => !existingStudentIds.has(s.id));

    if (newStudents.length === 0) {
      return NextResponse.json({
        success: true,
        created: 0,
        skipped: classStudents.length,
        total: classStudents.length,
      });
    }

    await db.insert(fees).values(
      newStudents.map((s) => ({
        studentId: s.id,
        schoolId,
        month,
        year,
        amount: String(amount),
        dueDate: dueDate || null,
        status: "pending" as const,
      }))
    );

    return NextResponse.json({
      success: true,
      created: newStudents.length,
      skipped: classStudents.length - newStudents.length,
      total: classStudents.length,
    });
  } catch (error) {
    console.error("[FEES_BULK_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}