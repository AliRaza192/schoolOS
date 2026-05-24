import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { studentSchema } from "@/lib/validations/student";

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

    const student = await db.query.students.findFirst({
      where: and(eq(students.id, id), eq(students.schoolId, schoolId)),
      with: { class: true },
    });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    return NextResponse.json({ student });
  } catch (error) {
    console.error("[STUDENT_GET]", error);
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
    const validated = studentSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const existing = await db.query.students.findFirst({
      where: and(eq(students.id, id), eq(students.schoolId, schoolId)),
    });

    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const [updated] = await db
      .update(students)
      .set({
        ...validated.data,
        fatherName: validated.data.fatherName || null,
        phone: validated.data.phone || null,
        address: validated.data.address || null,
        rollNo: validated.data.rollNo || null,
        dob: validated.data.dob || null,
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

    if (!existing) return NextResponse.json({ error: "Student not found" }, { status: 404 });

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