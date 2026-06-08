import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { schools, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchoolSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user?.schoolId || user.role !== "school_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = updateSchoolSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const [updated] = await db
      .update(schools)
      .set({ ...validated.data, updatedAt: new Date() })
      .where(eq(schools.id, user.schoolId))
      .returning();

    return NextResponse.json({ school: updated });
  } catch (error) {
    console.error("[SETTINGS_SCHOOL_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      with: { school: true },
    });

    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    return NextResponse.json({ school: user.school });
  } catch (error) {
    console.error("[SETTINGS_SCHOOL_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}