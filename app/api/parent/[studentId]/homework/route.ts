import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, parentStudents, homework, students } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

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
      return NextResponse.json({ homework: [] });
    }

    const result = await db.query.homework.findMany({
      where: and(
        eq(homework.classId, student.classId),
        eq(homework.isCompleted, false)
      ),
      with: { teacher: true },
      orderBy: asc(homework.dueDate),
    });

    return NextResponse.json({ homework: result });
  } catch (error) {
    console.error("[PARENT_HOMEWORK_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}