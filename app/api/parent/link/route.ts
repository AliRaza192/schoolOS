import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, students, parentStudents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { linkParentSchema } from "@/lib/validations/parent";
import { checkFeatureAccess } from "@/lib/subscription";

async function getAdminUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await getAdminUser(userId);
    if (!admin?.schoolId || admin.role !== "school_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Plan check
    const hasAccess = await checkFeatureAccess(admin.schoolId, "parent_portal");
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Parent portal Pro plan mein available hai" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = linkParentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { parentEmail, studentId } = validated.data;

    // Verify student belongs to school
    const student = await db.query.students.findFirst({
      where: and(
        eq(students.id, studentId),
        eq(students.schoolId, admin.schoolId)
      ),
      with: { class: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check parent exists
    const parentUser = await db.query.users.findFirst({
      where: eq(users.email, parentEmail),
    });

    if (!parentUser) {
      return NextResponse.json({
        notFound: true,
        message: "Yeh email registered nahi. Parent ko pehle SchoolOS par sign up karna hoga.",
      }, { status: 404 });
    }

    // Check already linked
    const existing = await db.query.parentStudents.findFirst({
      where: and(
        eq(parentStudents.parentUserId, parentUser.id),
        eq(parentStudents.studentId, studentId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Yeh parent pehle se is student se linked hai" },
        { status: 409 }
      );
    }

    await db.insert(parentStudents).values({
      parentUserId: parentUser.id,
      studentId,
      schoolId: admin.schoolId,
    });

    return NextResponse.json({
      success: true,
      parentName: parentUser.name,
      studentName: student.name,
    });
  } catch (error) {
    console.error("[PARENT_LINK_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await getAdminUser(userId);
    if (!admin?.schoolId || admin.role !== "school_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const links = await db.query.parentStudents.findMany({
      where: eq(parentStudents.schoolId, admin.schoolId),
      with: {
        parent: true,
        student: { with: { class: true } },
      },
      orderBy: parentStudents.createdAt,
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("[PARENT_LINK_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}