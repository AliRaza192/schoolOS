import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { homework, classes, users } from "@/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { homeworkSchema } from "@/lib/validations/timetable";

async function getUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId") ?? "";
    const isCompleted = searchParams.get("isCompleted");
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";

    const conditions = [eq(homework.schoolId, user.schoolId)];

    if (classId) conditions.push(eq(homework.classId, classId));
    if (isCompleted !== null) {
      conditions.push(eq(homework.isCompleted, isCompleted === "true"));
    } else {
      conditions.push(eq(homework.isCompleted, false));
    }
    if (dateFrom) conditions.push(gte(homework.dueDate, dateFrom));
    if (dateTo) conditions.push(lte(homework.dueDate, dateTo));

    const result = await db.query.homework.findMany({
      where: and(...conditions),
      with: {
        class: true,
        teacher: true,
      },
      orderBy: asc(homework.dueDate),
    });

    return NextResponse.json({ homework: result });
  } catch (error) {
    console.error("[HOMEWORK_GET]", error);
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
    const validated = homeworkSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { classId, subject, title, description, assignedDate, dueDate } =
      validated.data;

    const classRecord = await db.query.classes.findFirst({
      where: and(eq(classes.id, classId), eq(classes.schoolId, user.schoolId)),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const [hw] = await db
      .insert(homework)
      .values({
        schoolId: user.schoolId,
        classId,
        teacherId: user.id,
        subject,
        title,
        description: description || null,
        assignedDate,
        dueDate,
        isCompleted: false,
      })
      .returning();

    return NextResponse.json({ homework: hw }, { status: 201 });
  } catch (error) {
    console.error("[HOMEWORK_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}