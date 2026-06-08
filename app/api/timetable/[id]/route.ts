import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { timetableSlots, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";


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

    const existing = await db.query.timetableSlots.findFirst({
      where: and(
        eq(timetableSlots.id, id),
        eq(timetableSlots.schoolId, schoolId)
      ),
    });

    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    await db
      .delete(timetableSlots)
      .where(and(eq(timetableSlots.id, id), eq(timetableSlots.schoolId, schoolId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TIMETABLE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}