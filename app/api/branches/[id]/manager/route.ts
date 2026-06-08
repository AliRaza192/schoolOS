import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { assignBranchManagerSchema } from "@/lib/validations/branch";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// POST — assign branch manager
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    // Only school_admin can assign managers
    const currentUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (currentUser?.role !== "school_admin") {
      return NextResponse.json({ error: "Sirf school admin manager assign kar sakta hai" }, { status: 403 });
    }

    const { id: branchId } = await params;

    const branch = await db.query.branches.findFirst({
      where: and(eq(branches.id, branchId), eq(branches.schoolId, schoolId)),
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = assignBranchManagerSchema.safeParse({ ...body, branchId });
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { userId: managerUserId } = validated.data;

    // Verify user belongs to same school
    const manager = await db.query.users.findFirst({
      where: and(eq(users.id, managerUserId), eq(users.schoolId, schoolId)),
    });

    if (!manager) {
      return NextResponse.json({ error: "User is school mein nahi mila" }, { status: 404 });
    }

    // Update branch manager
    await db
      .update(branches)
      .set({ managerId: managerUserId, updatedAt: new Date() })
      .where(eq(branches.id, branchId));

    // Update user's branchId
    await db
      .update(users)
      .set({ branchId })
      .where(eq(users.id, managerUserId));

    return NextResponse.json({ success: true, managerName: manager.name });
  } catch (error) {
    console.error("[BRANCH_MANAGER_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
