import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { schools, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const onboardingSchema = z.object({
  schoolName: z.string().min(3).max(255),
  city: z.string().min(1),
  address: z.string().min(5),
  phone: z.string().regex(/^03[0-9]{9}$/),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (existingUser?.schoolId) {
      return NextResponse.json(
        { error: "School already set up" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = onboardingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { schoolName, city, address, phone, email } = validated.data;

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [school] = await db
      .insert(schools)
      .values({
        name: schoolName,
        city,
        address,
        phone,
        email,
        plan: "basic",
        isActive: true,
      })
      .returning();

    await db
      .insert(users)
      .values({
        clerkId: userId,
        schoolId: school.id,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        email: clerkUser.emailAddresses?.[0]?.emailAddress ?? email,
        role: "school_admin",
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          schoolId: school.id,
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        },
      });

    return NextResponse.json(
      { success: true, schoolId: school.id },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ONBOARDING_POST]", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}