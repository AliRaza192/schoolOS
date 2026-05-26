import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { homework, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

const updateSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

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
    const validated = updateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const existing = await db.query.homework.findFirst({
      where: and(eq(homework.id, id), eq(homework.schoolId, schoolId)),
    });

    if (!existing) return NextResponse.json({ error: "Homework not found" }, { status: 404 });

    const [updated] = await db
      .update(homework)
      .set({
        ...validated.data,
        description: validated.data.description || null,
      })
      .where(and(eq(homework.id, id), eq(homework.schoolId, schoolId)))
      .returning();

    return NextResponse.json({ homework: updated });
  } catch (error) {
    console.error("[HOMEWORK_PATCH]", error);
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

    const existing = await db.query.homework.findFirst({
      where: and(eq(homework.id, id), eq(homework.schoolId, schoolId)),
    });

    if (!existing) return NextResponse.json({ error: "Homework not found" }, { status: 404 });

    await db
      .delete(homework)
      .where(and(eq(homework.id, id), eq(homework.schoolId, schoolId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[HOMEWORK_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}