import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { branches, classes, students, users } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { createBranchSchema } from "@/lib/validations/branch";
import { checkPlanAccess } from "@/lib/plan-gate";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — list all branches for this school
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const access = await checkPlanAccess(schoolId, "academy");
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Multi-branch Academy plan mein available hai" }, { status: 403 });
    }

    const result = await db.query.branches.findMany({
      where: eq(branches.schoolId, schoolId),
      with: {
        manager: true,
      },
      orderBy: branches.name,
    });

    // Get stats for each branch
    const branchesWithStats = await Promise.all(
      result.map(async (branch) => {
        const [studentCount] = await db
          .select({ count: count() })
          .from(students)
          .innerJoin(classes, eq(students.classId, classes.id))
          .where(and(eq(classes.branchId, branch.id), eq(students.isActive, true)));

        const [classCount] = await db
          .select({ count: count() })
          .from(classes)
          .where(and(eq(classes.branchId, branch.id), eq(classes.isActive, true)));

        return {
          ...branch,
          studentCount: studentCount?.count ?? 0,
          classCount: classCount?.count ?? 0,
          managerName: branch.manager?.name ?? null,
        };
      })
    );

    return NextResponse.json({ branches: branchesWithStats });
  } catch (error) {
    console.error("[BRANCHES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — create a new branch
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const access = await checkPlanAccess(schoolId, "academy");
    if (!access.hasAccess) {
      return NextResponse.json({ error: "Multi-branch Academy plan mein available hai" }, { status: 403 });
    }

    const body = await req.json();
    const validated = createBranchSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", issues: validated.error.issues }, { status: 422 });
    }

    const { name, address, city, phone, isMainBranch } = validated.data;

    // Check branch limit (10 max)
    const existingBranches = await db.query.branches.findMany({
      where: eq(branches.schoolId, schoolId),
    });

    if (existingBranches.length >= 10) {
      return NextResponse.json({ error: "Maximum 10 branches allowed" }, { status: 400 });
    }

    // Auto-generate branch code
    const branchNumber = existingBranches.length + 1;
    const branchCode = `BR-${String(branchNumber).padStart(3, "0")}`;

    // If marking as main branch, unmark others
    if (isMainBranch) {
      await db
        .update(branches)
        .set({ isMainBranch: false })
        .where(eq(branches.schoolId, schoolId));
    }

    const result = await db
      .insert(branches)
      .values({
        schoolId,
        name,
        address: address || null,
        city: city || null,
        phone: phone || null,
        branchCode,
        isMainBranch: isMainBranch ?? false,
        isActive: true,
      })
      .returning() as unknown as typeof branches.$inferSelect[];

    return NextResponse.json({ branch: result[0] }, { status: 201 });
  } catch (error) {
    console.error("[BRANCHES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
