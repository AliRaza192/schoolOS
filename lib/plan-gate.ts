import { getSchoolSubscriptionStatus, type PlanType } from "./subscription";

const PLAN_HIERARCHY: Record<PlanType, number> = {
  basic: 1,
  pro: 2,
  academy: 3,
};

export async function checkPlanAccess(
  schoolId: string,
  requiredPlan: PlanType
): Promise<{
  hasAccess: boolean;
  currentPlan: PlanType;
  requiredPlan: PlanType;
}> {
  const status = await getSchoolSubscriptionStatus(schoolId);

  const currentLevel = PLAN_HIERARCHY[status.plan];
  const requiredLevel = PLAN_HIERARCHY[requiredPlan];

  return {
    hasAccess: status.isActive && currentLevel >= requiredLevel,
    currentPlan: status.plan,
    requiredPlan,
  };
}