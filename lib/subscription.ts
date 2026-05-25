import { db } from "@/db";
import { schools, students } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export const PLAN_LIMITS = {
  basic: {
    maxStudents: 200,
    aiReports: false,
    parentPortal: false,
    multiBranch: false,
    price: 1500,
  },
  pro: {
    maxStudents: null,
    aiReports: true,
    parentPortal: true,
    multiBranch: false,
    price: 3000,
  },
  academy: {
    maxStudents: null,
    aiReports: true,
    parentPortal: true,
    multiBranch: true,
    price: 5000,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type FeatureType = "ai_reports" | "parent_portal" | "multi_branch";

export interface SubscriptionStatus {
  plan: PlanType;
  status: "trial" | "active" | "expired" | "cancelled";
  daysRemaining: number;
  isActive: boolean;
  limits: {
    maxStudents: number | null;
    aiReports: boolean;
    parentPortal: boolean;
    multiBranch: boolean;
  };
}

export async function getSchoolSubscriptionStatus(
  schoolId: string
): Promise<SubscriptionStatus> {
  const school = await db.query.schools.findFirst({
    where: eq(schools.id, schoolId),
  });

  if (!school) {
    return {
      plan: "basic",
      status: "expired",
      daysRemaining: 0,
      isActive: false,
      limits: PLAN_LIMITS.basic,
    };
  }

  const plan = (school.plan ?? "basic") as PlanType;
  const limits = PLAN_LIMITS[plan];
  const today = new Date();

  // No expiry date — old school, treat as active basic
  if (!school.planExpiresAt) {
    return {
      plan,
      status: "active",
      daysRemaining: 999,
      isActive: true,
      limits,
    };
  }

  const expiresAt = new Date(school.planExpiresAt);
  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining > 0) {
    // Check if trial (within first 14 days of creation)
    const createdAt = new Date(school.createdAt);
    const daysSinceCreation = Math.ceil(
      (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isTrial = daysSinceCreation <= 14 && plan === "basic";

    return {
      plan,
      status: isTrial ? "trial" : "active",
      daysRemaining,
      isActive: true,
      limits,
    };
  }

  return {
    plan,
    status: "expired",
    daysRemaining: 0,
    isActive: false,
    limits,
  };
}

export async function checkFeatureAccess(
  schoolId: string,
  feature: FeatureType
): Promise<boolean> {
  const status = await getSchoolSubscriptionStatus(schoolId);
  if (!status.isActive) return false;

  switch (feature) {
    case "ai_reports":
      return status.limits.aiReports;
    case "parent_portal":
      return status.limits.parentPortal;
    case "multi_branch":
      return status.limits.multiBranch;
    default:
      return false;
  }
}

export async function checkStudentLimit(schoolId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number | null;
}> {
  const status = await getSchoolSubscriptionStatus(schoolId);
  const limit = status.limits.maxStudents;

  const result = await db
    .select({ count: count() })
    .from(students)
    .where(and(eq(students.schoolId, schoolId), eq(students.isActive, true)));

  const current = result[0]?.count ?? 0;

  if (limit === null) {
    return { allowed: true, current, limit: null };
  }

  return {
    allowed: current < limit,
    current,
    limit,
  };
}