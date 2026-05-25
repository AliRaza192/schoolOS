import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions, schools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSubscriptionConfirmedEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
      with: { school: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const expiryDate = new Date(subscription.endDate);

    // Activate subscription
    await db
      .update(subscriptions)
      .set({ status: "active", confirmedAt: new Date() })
      .where(eq(subscriptions.id, id));

    // Update school plan
    await db
      .update(schools)
      .set({
        plan: subscription.plan,
        planExpiresAt: expiryDate,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, subscription.schoolId));

    // Get school admin email
    const schoolAdmin = await db.query.users.findFirst({
      where: eq(users.schoolId, subscription.schoolId),
    });

    // Send confirmation email — silently fail
    if (schoolAdmin?.email && subscription.school) {
      await sendSubscriptionConfirmedEmail(
        schoolAdmin.email,
        subscription.school.name,
        subscription.plan,
        expiryDate
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await db
      .update(subscriptions)
      .set({ status: "cancelled" })
      .where(eq(subscriptions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}