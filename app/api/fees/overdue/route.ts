import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { fees, users } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const today = new Date().toISOString().split("T")[0];

    const result = await db
      .update(fees)
      .set({ status: "overdue" })
      .where(
        and(
          eq(fees.schoolId, user.schoolId),
          eq(fees.status, "pending"),
          lt(fees.dueDate, today)
        )
      )
      .returning();

    return NextResponse.json({ updated: result.length });
  } catch (error) {
    console.error("[FEES_OVERDUE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}