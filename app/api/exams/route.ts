import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams, examResults, classes, users } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { createExamSchema } from "@/lib/validations/exam";


export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ?? "";

    const conditions = [
      eq(exams.schoolId, schoolId),
      eq(exams.isActive, true),
    ];

    if (classId) conditions.push(eq(exams.classId, classId));

    const result = await db.query.exams.findMany({
      where: and(...conditions),
      with: {
        class: true,
        results: true,
      },
      orderBy: exams.examDate,
    });

    const examsWithCount = result.map((exam) => ({
      ...exam,
      subjects: JSON.parse(exam.subjects) as string[],
      resultsCount: exam.results.length,
    }));

    return NextResponse.json({ exams: examsWithCount });
  } catch (error) {
    console.error("[EXAMS_GET]", error);
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
    const validated = createExamSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { name, classId, totalMarks, examDate, subjects } = validated.data;

    const classRecord = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.schoolId, schoolId)),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const [exam] = await db
      .insert(exams)
      .values({
        schoolId,
        classId,
        name,
        totalMarks: String(totalMarks),
        examDate,
        subjects: JSON.stringify(subjects),
        isActive: true,
      })
      .returning();

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error) {
    console.error("[EXAMS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}