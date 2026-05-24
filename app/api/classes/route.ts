import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { classes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { classSchema } from "@/lib/validations/class";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const result = await db.query.classes.findMany({
      where: and(eq(classes.schoolId, schoolId), eq(classes.isActive, true)),
      with: { teacher: true },
      orderBy: classes.name,
    });

    return NextResponse.json({ classes: result });
  } catch (error) {
    console.error("[CLASSES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = classSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { name, section, academicYear, teacherId } = validated.data;

    const existing = await db.query.classes.findFirst({
      where: and(
        eq(classes.schoolId, schoolId),
        eq(classes.name, name),
        eq(classes.academicYear, academicYear),
        eq(classes.isActive, true)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Yeh class pehle se exist karti hai" },
        { status: 409 }
      );
    }

    const [newClass] = await db
      .insert(classes)
      .values({
        schoolId,
        name,
        section: section || null,
        academicYear,
        teacherId: teacherId || null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error("[CLASSES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}