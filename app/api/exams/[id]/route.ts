import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { exams, examResults, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

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

    const exam = await db.query.exams.findFirst({
      where: and(eq(exams.id, id), eq(exams.schoolId, schoolId)),
      with: {
        class: true,
        results: {
          with: { student: true },
        },
      },
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const results = exam.results.map((r) => ({
      ...r,
      subjectResults: JSON.parse(r.subjectResults),
    }));

    const percentages = results.map((r) => Number(r.percentage));
    const stats = {
      highest: percentages.length > 0 ? Math.max(...percentages) : 0,
      lowest: percentages.length > 0 ? Math.min(...percentages) : 0,
      average:
        percentages.length > 0
          ? Math.round(
              percentages.reduce((a, b) => a + b, 0) / percentages.length
            )
          : 0,
      passCount: results.filter((r) => Number(r.percentage) >= 50).length,
      failCount: results.filter((r) => Number(r.percentage) < 50).length,
    };

    return NextResponse.json({
      exam: {
        ...exam,
        subjects: JSON.parse(exam.subjects),
        results,
      },
      stats,
    });
  } catch (error) {
    console.error("[EXAM_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;
    const body = await req.json();

    const existing = await db.query.exams.findFirst({
      where: and(eq(exams.id, id), eq(exams.schoolId, schoolId)),
    });

    if (!existing) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const [updated] = await db
      .update(exams)
      .set({
        name: body.name ?? existing.name,
        examDate: body.examDate ?? existing.examDate,
      })
      .where(and(eq(exams.id, id), eq(exams.schoolId, schoolId)))
      .returning();

    return NextResponse.json({ exam: updated });
  } catch (error) {
    console.error("[EXAM_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    await db
      .update(exams)
      .set({ isActive: false })
      .where(and(eq(exams.id, id), eq(exams.schoolId, schoolId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EXAM_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}