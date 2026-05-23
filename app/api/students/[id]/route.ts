import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { students, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  fatherName: z.string().min(2).optional(),
  phone: z.string().regex(/^03[0-9]{9}$/).optional().or(z.literal("")),
  address: z.string().optional(),
  classId: z.string().uuid().optional().or(z.literal("")),
  rollNo: z.string().optional(),
  dob: z.string().optional(),
  isActive: z.boolean().optional(),
});

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — Single student
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

    const student = await db.query.students.findFirst({
      where: and(eq(students.id, id), eq(students.schoolId, schoolId)),
      with: { class: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("[STUDENT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — Update student
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
    const validated = updateStudentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const existing = await db.query.students.findFirst({
      where: and(eq(students.id, id), eq(students.schoolId, schoolId)),
    });

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(students)
      .set({
        ...validated.data,
        classId: validated.data.classId || null,
        phone: validated.data.phone || null,
        updatedAt: new Date(),
      })
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)))
      .returning();

    return NextResponse.json({ student: updated });
  } catch (error) {
    console.error("[STUDENT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — Soft delete student
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

    const existing = await db.query.students.findFirst({
      where: and(eq(students.id, id), eq(students.schoolId, schoolId)),
    });

    if (!existing) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await db
      .update(students)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(students.id, id), eq(students.schoolId, schoolId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[STUDENT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}