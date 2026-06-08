import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { timetableSlots, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { bulkTimetableSchema } from "@/lib/validations/timetable";


export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = bulkTimetableSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { classId, slots } = validated.data;

    // Delete existing slots for this class
    await db
      .delete(timetableSlots)
      .where(
        and(
          eq(timetableSlots.classId, classId),
          eq(timetableSlots.schoolId, schoolId)
        )
      );

    // Bulk insert
    await db.insert(timetableSlots).values(
      slots.map((slot) => ({
        schoolId,
        classId,
        dayOfWeek: slot.dayOfWeek,
        periodNumber: slot.periodNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject,
        teacherId: slot.teacherId || null,
        room: slot.room || null,
      }))
    );

    return NextResponse.json({ success: true, created: slots.length });
  } catch (error) {
    console.error("[TIMETABLE_BULK_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}