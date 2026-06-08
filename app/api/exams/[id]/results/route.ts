import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams, examResults, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { bulkResultSchema } from "@/lib/validations/exam";
import {
  calculateGrade,
  calculatePositions,
  generateResultRemarks,
} from "@/lib/exam-utils";


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

    const results = await db.query.examResults.findMany({
      where: and(
        eq(examResults.examId, id),
        eq(examResults.schoolId, schoolId)
      ),
      with: { student: true },
      orderBy: examResults.position,
    });

    return NextResponse.json({
      results: results.map((r) => ({
        ...r,
        subjectResults: JSON.parse(r.subjectResults),
      })),
    });
  } catch (error) {
    console.error("[EXAM_RESULTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id: examId } = await params;
    const body = await req.json();
    const validated = bulkResultSchema.safeParse({ examId, ...body });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const exam = await db.query.exams.findFirst({
      where: and(eq(exams.id, examId), eq(exams.schoolId, schoolId)),
      with: { results: true },
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    // Process results
    const processedResults = validated.data.results.map((result) => {
      const totalObtained = result.subjectResults.reduce(
        (sum, s) => sum + s.marks, 0
      );
      const totalPossible = result.subjectResults.reduce(
        (sum, s) => sum + s.totalMarks, 0
      );
      const percentage =
        totalPossible > 0
          ? Math.round((totalObtained / totalPossible) * 10000) / 100
          : 0;
      const grade = calculateGrade(percentage);

      return {
        examId,
        studentId: result.studentId,
        schoolId: schoolId!,
        subjectResults: JSON.stringify(result.subjectResults),
        totalObtained: String(totalObtained),
        totalPossible: String(totalPossible),
        percentage: String(percentage),
        grade,
        remarks: null,
        position: 0,
      };
    });

    // Upsert all results
    for (const result of processedResults) {
      await db
        .insert(examResults)
        .values(result)
        .onConflictDoUpdate({
          target: [examResults.examId, examResults.studentId],
          set: {
            subjectResults: result.subjectResults,
            totalObtained: result.totalObtained,
            totalPossible: result.totalPossible,
            percentage: result.percentage,
            grade: result.grade,
            updatedAt: new Date(),
          },
        });
    }

    // Recalculate positions
    const allResults = await db.query.examResults.findMany({
      where: and(
        eq(examResults.examId, examId),
        eq(examResults.schoolId, schoolId)
      ),
      with: { student: true },
    });

    const withPositions = calculatePositions(
      allResults.map((r) => ({
        ...r,
        percentage: Number(r.percentage),
      }))
    );

    for (const result of withPositions) {
      await db
        .update(examResults)
        .set({ position: result.position })
        .where(eq(examResults.id, result.id));
    }

    return NextResponse.json({
      success: true,
      processed: processedResults.length,
    });
  } catch (error) {
    console.error("[EXAM_RESULTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}