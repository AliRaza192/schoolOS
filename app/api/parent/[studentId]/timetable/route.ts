import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, parentStudents, timetableSlots, students } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await params;

    const link = await db.query.parentStudents.findFirst({
      where: and(
        eq(parentStudents.parentUserId, user.id),
        eq(parentStudents.studentId, studentId)
      ),
    });

    if (!link) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const student = await db.query.students.findFirst({
      where: eq(students.id, studentId),
    });

    if (!student?.classId) {
      return NextResponse.json({ schedule: {}, className: "No Class" });
    }

    const slots = await db.query.timetableSlots.findMany({
      where: eq(timetableSlots.classId, student.classId),
      with: { teacher: true },
      orderBy: [timetableSlots.dayOfWeek, timetableSlots.periodNumber],
    });

    const schedule: Record<string, typeof slots> = {};
    DAYS.forEach((day, index) => {
      schedule[day] = slots.filter((s) => s.dayOfWeek === index + 1);
    });

    return NextResponse.json({ schedule, classId: student.classId });
  } catch (error) {
    console.error("[PARENT_TIMETABLE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}