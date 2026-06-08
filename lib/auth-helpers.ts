import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AuthUser = {
  id: string;
  clerkId: string;
  schoolId: string;
  branchId: string | null;
  name: string;
  email: string;
  role: "super_admin" | "school_admin" | "teacher" | "parent";
};

// Full user object chahiye to yeh use karo
export async function getAuthUser(clerkUserId: string): Promise<AuthUser | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
  });
  if (!user || !user.schoolId) return null;
  return user as AuthUser;
}

// Sirf schoolId chahiye to yeh use karo (faster)
export async function getSchoolId(clerkUserId: string): Promise<string | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
    columns: { schoolId: true },
  });
  return user?.schoolId ?? null;
}