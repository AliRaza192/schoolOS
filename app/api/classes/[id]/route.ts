import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { classSchema } from "@/lib/validations/class";


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
    const validated = classSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const existing = await db.query.classes.findFirst({
      where: and(eq(classes.id, id), eq(classes.schoolId, schoolId)),
    });

    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(classes)
      .set({
        ...validated.data,
        section: validated.data.section || null,
        teacherId: validated.data.teacherId || null,
      })
      .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)))
      .returning();

    return NextResponse.json({ class: updated });
  } catch (error) {
    console.error("[CLASS_PATCH]", error);
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

    const existing = await db.query.classes.findFirst({
      where: and(eq(classes.id, id), eq(classes.schoolId, schoolId)),
    });

    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await db
      .update(classes)
      .set({ isActive: false })
      .where(and(eq(classes.id, id), eq(classes.schoolId, schoolId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLASS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}