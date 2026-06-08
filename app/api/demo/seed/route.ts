import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateDemoData } from "@/lib/demo-seeder";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    return NextResponse.json({
      hasDemo: !!user?.schoolId,
      schoolId: user?.schoolId ?? null,
    });
  } catch (error) {
    console.error("[DEMO_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (existingUser?.schoolId) {
      return NextResponse.json({
        alreadyExists: true,
        schoolId: existingUser.schoolId,
      });
    }

    const result = await generateDemoData(userId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[DEMO_SEED_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}