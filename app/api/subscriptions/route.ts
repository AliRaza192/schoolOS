import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { getSchoolSubscriptionStatus } from "@/lib/subscription";
import { sendSubscriptionRequestEmail } from "@/lib/email";

const subscriptionRequestSchema = z.object({
  plan: z.enum(["basic", "pro", "academy"]),
  paymentMethod: z.enum(["easypaisa", "jazzcash", "bank_transfer"]),
  paymentProof: z.string().min(1, "Transaction ID required"),
  months: z.number().min(1).max(12),
});

async function getUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { school: true },
  });
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const [subscriptionStatus, history] = await Promise.all([
      getSchoolSubscriptionStatus(user.schoolId),
      db.query.subscriptions.findMany({
        where: eq(subscriptions.schoolId, user.schoolId),
        orderBy: desc(subscriptions.createdAt),
      }),
    ]);

    return NextResponse.json({ status: subscriptionStatus, history });
  } catch (error) {
    console.error("[SUBSCRIPTIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = subscriptionRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { plan, paymentMethod, paymentProof, months } = validated.data;
    const planPrices = { basic: 1500, pro: 3000, academy: 5000 };
    const discounts: Record<number, number> = { 1: 0, 3: 5, 6: 10, 12: 15 };
    const baseAmount = planPrices[plan] * months;
    const discount = discounts[months] ?? 0;
    const amount = Math.round(baseAmount * (1 - discount / 100));

    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        schoolId: user.schoolId,
        plan,
        amount: String(amount),
        startDate,
        endDate,
        paymentMethod,
        paymentProof,
        status: "pending",
      })
      .returning();

    // Email to admin — silently fail
    await sendSubscriptionRequestEmail(
      user.school?.name ?? "Unknown School",
      plan,
      amount,
      paymentMethod,
      paymentProof
    );

    return NextResponse.json(
      { success: true, subscriptionId: subscription.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SUBSCRIPTIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}