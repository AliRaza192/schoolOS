import { db } from "@/db";
import { users, branches } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface BranchAccess {
  role: string;
  schoolId: string;
  branchId: string | null;
  canAccessAllBranches: boolean;
  accessibleBranchIds: string[];
}

export async function getUserBranchAccess(clerkId: string): Promise<BranchAccess | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user?.schoolId) return null;

  const role = user.role;
  const branchId = user.branchId;

  // school_admin with no branchId = owner, can access all branches
  if (role === "school_admin" && !branchId) {
    const allBranches = await db.query.branches.findMany({
      where: eq(branches.schoolId, user.schoolId),
    });

    return {
      role,
      schoolId: user.schoolId,
      branchId: null,
      canAccessAllBranches: true,
      accessibleBranchIds: allBranches.map((b) => b.id),
    };
  }

  // teacher/manager with branchId = only their branch
  return {
    role,
    schoolId: user.schoolId,
    branchId: branchId ?? null,
    canAccessAllBranches: false,
    accessibleBranchIds: branchId ? [branchId] : [],
  };
}

export async function isBranchAccessAllowed(
  clerkId: string,
  branchId: string
): Promise<boolean> {
  const access = await getUserBranchAccess(clerkId);
  if (!access) return false;
  if (access.canAccessAllBranches) return true;
  return access.accessibleBranchIds.includes(branchId);
}

export async function filterByBranchAccess(
  clerkId: string,
): Promise<string[] | null> {
  const access = await getUserBranchAccess(clerkId);
  if (!access) return [];
  if (access.canAccessAllBranches) return null; // null = no filter needed
  return access.accessibleBranchIds;
}
