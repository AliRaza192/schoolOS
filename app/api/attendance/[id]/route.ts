import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["present", "absent", "leave"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user?.schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    // Verify record belongs to school
    const existing = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.id, id),
        eq(attendance.schoolId, user.schoolId)
      ),
    });

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(attendance)
      .set({ status: validated.data.status })
      .where(and(eq(attendance.id, id), eq(attendance.schoolId, user.schoolId)))
      .returning();

    return NextResponse.json({ attendance: updated });
  } catch (error) {
    console.error("[ATTENDANCE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}