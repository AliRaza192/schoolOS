import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches, classes, students, users } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { updateBranchSchema } from "@/lib/validations/branch";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — branch details with stats
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

    const branch = await db.query.branches.findFirst({
      where: and(eq(branches.id, id), eq(branches.schoolId, schoolId)),
      with: { manager: true },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const [studentCount] = await db
      .select({ count: count() })
      .from(students)
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(and(eq(classes.branchId, branch.id), eq(students.isActive, true)));

    const [classCount] = await db
      .select({ count: count() })
      .from(classes)
      .where(and(eq(classes.branchId, branch.id), eq(classes.isActive, true)));

    return NextResponse.json({
      branch: {
        ...branch,
        studentCount: studentCount?.count ?? 0,
        classCount: classCount?.count ?? 0,
        managerName: branch.manager?.name ?? null,
      },
    });
  } catch (error) {
    console.error("[BRANCH_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update branch info
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

    const branch = await db.query.branches.findFirst({
      where: and(eq(branches.id, id), eq(branches.schoolId, schoolId)),
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateBranchSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const result = await db
      .update(branches)
      .set({
        ...validated.data,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, id))
      .returning() as unknown as typeof branches.$inferSelect[];

    return NextResponse.json({ branch: result[0] });
  } catch (error) {
    console.error("[BRANCH_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — soft delete (deactivate)
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

    const branch = await db.query.branches.findFirst({
      where: and(eq(branches.id, id), eq(branches.schoolId, schoolId)),
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    // Check if branch has students
    const [studentCount] = await db
      .select({ count: count() })
      .from(students)
      .innerJoin(classes, eq(students.classId, classes.id))
      .where(and(eq(classes.branchId, id), eq(students.isActive, true)));

    if ((studentCount?.count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Pehle students transfer karo. Is branch mein abhi students hain." },
        { status: 400 }
      );
    }

    await db
      .update(branches)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(branches.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BRANCH_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
