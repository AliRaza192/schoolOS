import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, users } from "@/db/schema";
import { eq, and, ilike, or, count } from "drizzle-orm";
import { studentSchema } from "@/lib/validations/student";

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const classId = searchParams.get("classId") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 25;
    const offset = (page - 1) * limit;

    const conditions = [
      eq(students.schoolId, schoolId),
      eq(students.isActive, true),
    ];

    if (classId) conditions.push(eq(students.classId, classId));
    if (search) {
      conditions.push(
        or(
          ilike(students.name, `%${search}%`),
          ilike(students.fatherName, `%${search}%`)
        )!
      );
    }

    const [result, totalResult] = await Promise.all([
      db.query.students.findMany({
        where: and(...conditions),
        with: { class: true },
        orderBy: students.name,
        limit,
        offset,
      }),
      db.select({ count: count() }).from(students).where(and(...conditions)),
    ]);

    return NextResponse.json({
      students: result,
      total: totalResult[0]?.count ?? 0,
    });
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
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
    const validated = studentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { name, fatherName, classId, rollNo, phone, address, dob, admissionDate } =
      validated.data;

    if (rollNo && classId) {
      const duplicate = await db.query.students.findFirst({
        where: and(
          eq(students.schoolId, schoolId),
          eq(students.classId, classId),
          eq(students.rollNo, rollNo),
          eq(students.isActive, true)
        ),
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Yeh roll number is class mein pehle se hai" },
          { status: 409 }
        );
      }
    }

    const [student] = await db
      .insert(students)
      .values({
        schoolId,
        name,
        fatherName: fatherName || null,
        classId: classId || null,
        rollNo: rollNo || null,
        phone: phone || null,
        address: address || null,
        dob: dob || null,
        admissionDate,
        isActive: true,
      })
      .returning();

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error("[STUDENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}