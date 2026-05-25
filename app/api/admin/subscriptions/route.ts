import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pending = await db.query.subscriptions.findMany({
      where: eq(subscriptions.status, "pending"),
      with: { school: true },
      orderBy: desc(subscriptions.createdAt),
    });

    return NextResponse.json({ subscriptions: pending });
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}