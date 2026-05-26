import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const parentOnboardingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (existing) {
      return NextResponse.json(
        { success: true, message: "Already onboarded" },
        { status: 200 }
      );
    }

    const body = await req.json();
    const validated = parentOnboardingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 422 }
      );
    }

    await db.insert(users).values({
      clerkId: userId,
      schoolId: null,
      name: validated.data.name,
      email: validated.data.email,
      role: "parent",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[PARENT_ONBOARDING_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}