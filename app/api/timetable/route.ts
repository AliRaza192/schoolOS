import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { timetableSlots, classes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { timetableSlotSchema } from "@/lib/validations/timetable";

const DAYS = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
];

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
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 });
    }

    const classRecord = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.schoolId, schoolId)),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const slots = await db.query.timetableSlots.findMany({
      where: and(
        eq(timetableSlots.classId, classId),
        eq(timetableSlots.schoolId, schoolId)
      ),
      with: { teacher: true },
      orderBy: [timetableSlots.dayOfWeek, timetableSlots.periodNumber],
    });

    // Group by day
    const schedule: Record<string, typeof slots> = {};
    DAYS.forEach((day, index) => {
      schedule[day] = slots.filter((s) => s.dayOfWeek === index + 1);
    });

    return NextResponse.json({
      classId,
      className: `${classRecord.name}${classRecord.section ? ` (${classRecord.section})` : ""}`,
      schedule,
    });
  } catch (error) {
    console.error("[TIMETABLE_GET]", error);
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
    const validated = timetableSlotSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { classId, dayOfWeek, periodNumber, startTime, endTime, subject, teacherId, room } =
      validated.data;

    // Check duplicate period
    const existing = await db.query.timetableSlots.findFirst({
      where: and(
        eq(timetableSlots.classId, classId),
        eq(timetableSlots.dayOfWeek, dayOfWeek),
        eq(timetableSlots.periodNumber, periodNumber)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Is period mein already subject assigned hai" },
        { status: 409 }
      );
    }

    // Check teacher conflict
    if (teacherId) {
      const teacherConflict = await db.query.timetableSlots.findFirst({
        where: and(
          eq(timetableSlots.teacherId, teacherId),
          eq(timetableSlots.dayOfWeek, dayOfWeek),
          eq(timetableSlots.schoolId, schoolId)
        ),
      });

      if (teacherConflict) {
        const conflictStart = teacherConflict.startTime;
        const conflictEnd = teacherConflict.endTime;
        if (
          (startTime >= conflictStart && startTime < conflictEnd) ||
          (endTime > conflictStart && endTime <= conflictEnd)
        ) {
          return NextResponse.json(
            { error: "Teacher already busy hai is time par" },
            { status: 409 }
          );
        }
      }
    }

    const [slot] = await db
      .insert(timetableSlots)
      .values({
        schoolId,
        classId,
        dayOfWeek,
        periodNumber,
        startTime,
        endTime,
        subject,
        teacherId: teacherId || null,
        room: room || null,
      })
      .returning();

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error("[TIMETABLE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}