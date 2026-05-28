import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  classes,
  students,
  attendance,
  fees,
  onboardingProgress,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";

async function getUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
}

async function checkSteps(schoolId: string) {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [
    classCount,
    studentCount,
    attendanceCount,
    feeCount,
  ] = await Promise.all([
    db.select({ count: count() }).from(classes)
      .where(and(eq(classes.schoolId, schoolId), eq(classes.isActive, true))),
    db.select({ count: count() }).from(students)
      .where(and(eq(students.schoolId, schoolId), eq(students.isActive, true))),
    db.select({ count: count() }).from(attendance)
      .where(and(eq(attendance.schoolId, schoolId), eq(attendance.date, today))),
    db.select({ count: count() }).from(fees)
      .where(eq(fees.schoolId, schoolId)),
  ]);

  return {
    hasClasses: (classCount[0]?.count ?? 0) > 0,
    hasStudents: (studentCount[0]?.count ?? 0) >= 3,
    hasAttendance: (attendanceCount[0]?.count ?? 0) > 0,
    hasFees: (feeCount[0]?.count ?? 0) > 0,
    hasReports: false,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const checks = await checkSteps(user.schoolId);

    // Get or create progress
    let progress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.schoolId, user.schoolId),
    });

    if (!progress) {
      const [created] = await db
        .insert(onboardingProgress)
        .values({
          schoolId: user.schoolId,
          completedSteps: "[]",
          currentStep: "add_class",
          isCompleted: false,
        })
        .returning();
      progress = created;
    }

    const completedSteps: string[] = JSON.parse(progress.completedSteps);

    // Auto-update completed steps based on DB checks
    const checkMap: Record<string, boolean> = {
      add_class: checks.hasClasses,
      add_students: checks.hasStudents,
      mark_attendance: checks.hasAttendance,
      generate_fees: checks.hasFees,
      explore_reports: checks.hasReports,
    };

    const autoCompleted = ONBOARDING_STEPS
      .filter((s) => checkMap[s.id])
      .map((s) => s.id);

    const allCompleted = [...new Set([...completedSteps, ...autoCompleted])];
    const currentStep =
      ONBOARDING_STEPS.find((s) => !allCompleted.includes(s.id))?.id ??
      "explore_reports";
    const isCompleted = allCompleted.length >= ONBOARDING_STEPS.length;

    // Update in DB
    await db
      .update(onboardingProgress)
      .set({
        completedSteps: JSON.stringify(allCompleted),
        currentStep,
        isCompleted,
        completedAt: isCompleted && !progress.completedAt ? new Date() : progress.completedAt,
      })
      .where(eq(onboardingProgress.schoolId, user.schoolId));

    return NextResponse.json({
      currentStep,
      completedSteps: allCompleted,
      isCompleted,
      steps: ONBOARDING_STEPS.map((step) => ({
        ...step,
        isCompleted: allCompleted.includes(step.id),
        isCurrent: step.id === currentStep,
      })),
    });
  } catch (error) {
    console.error("[ONBOARDING_PROGRESS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { stepId } = await req.json();

    const progress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.schoolId, user.schoolId),
    });

    if (!progress) return NextResponse.json({ error: "Progress not found" }, { status: 404 });

    const completedSteps: string[] = JSON.parse(progress.completedSteps);
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }

    const currentStepIndex = ONBOARDING_STEPS.findIndex((s) => !completedSteps.includes(s.id));
    const currentStep =
      currentStepIndex >= 0
        ? ONBOARDING_STEPS[currentStepIndex].id
        : ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1].id;

    const isCompleted = completedSteps.length >= ONBOARDING_STEPS.length;

    await db
      .update(onboardingProgress)
      .set({
        completedSteps: JSON.stringify(completedSteps),
        currentStep,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
      .where(eq(onboardingProgress.schoolId, user.schoolId));

    return NextResponse.json({ success: true, completedSteps, currentStep, isCompleted });
  } catch (error) {
    console.error("[ONBOARDING_PROGRESS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}