import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches, students, classes, studentTransfers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { transferStudentSchema } from "@/lib/validations/branch";


// POST — transfer student between branches
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    // Only school_admin can transfer
    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (currentUser?.role !== "school_admin") {
      return NextResponse.json({ error: "Sirf school admin transfer kar sakta hai" }, { status: 403 });
    }

    const body = await req.json();
    const validated = transferStudentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { studentId, fromBranchId, toBranchId, transferDate, reason, newClassId } = validated.data;

    // Verify both branches belong to same school
    const [fromBranch, toBranch] = await Promise.all([
      db.query.branches.findFirst({
        where: and(eq(branches.id, fromBranchId), eq(branches.schoolId, schoolId)),
      }),
      db.query.branches.findFirst({
        where: and(eq(branches.id, toBranchId), eq(branches.schoolId, schoolId)),
      }),
    ]);

    if (!fromBranch || !toBranch) {
      return NextResponse.json({ error: "Branch nahi mili" }, { status: 404 });
    }

    if (fromBranchId === toBranchId) {
      return NextResponse.json({ error: "Source aur destination branch same nahi ho sakti" }, { status: 400 });
    }

    // Verify student belongs to school
    const student = await db.query.students.findFirst({
      where: and(eq(students.id, studentId), eq(students.schoolId, schoolId)),
    });

    if (!student) {
      return NextResponse.json({ error: "Student nahi mila" }, { status: 404 });
    }

    // Update student's class if newClassId provided
    if (newClassId) {
      const targetClass = await db.query.classes.findFirst({
        where: and(eq(classes.id, newClassId), eq(classes.schoolId, schoolId)),
      });

      if (!targetClass) {
        return NextResponse.json({ error: "Target class nahi mili" }, { status: 404 });
      }

      await db
        .update(students)
        .set({ classId: newClassId, updatedAt: new Date() })
        .where(eq(students.id, studentId));
    }

    // Create transfer record
    const result = await db
      .insert(studentTransfers)
      .values({
        studentId,
        fromBranchId,
        toBranchId,
        transferDate,
        reason: reason || null,
        transferredByUserId: currentUser.id,
      })
      .returning() as unknown as typeof studentTransfers.$inferSelect[];

    return NextResponse.json({ success: true, transfer: result[0] });
  } catch (error) {
    console.error("[BRANCH_TRANSFER_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
