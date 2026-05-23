import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { students, users, classes } from "@/db/schema";
import { eq, and, ilike, desc } from "drizzle-orm";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  fatherName: z.string().min(2, "Father name must be at least 2 characters"),
  phone: z.string().regex(/^03[0-9]{9}$/, "Invalid Pakistani phone number").optional().or(z.literal("")),
  address: z.string().optional(),
  classId: z.string().uuid("Invalid class").optional().or(z.literal("")),
  rollNo: z.string().optional(),
  dob: z.string().optional(),
  admissionDate: z.string(),
});

async function getSchoolId(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  return user?.schoolId;
}

// GET — List all students
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId") || "";

    const conditions = [
      eq(students.schoolId, schoolId),
      eq(students.isActive, true),
    ];

    if (search) {
      conditions.push(ilike(students.name, `%${search}%`));
    }

    if (classId) {
      conditions.push(eq(students.classId, classId));
    }

    const result = await db.query.students.findMany({
      where: and(...conditions),
      with: { class: true },
      orderBy: desc(students.createdAt),
    });

    return NextResponse.json({ students: result });
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — Create student
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

    const { name, fatherName, phone, address, classId, rollNo, dob, admissionDate } = validated.data;

    const [student] = await db
      .insert(students)
      .values({
        schoolId,
        name,
        fatherName,
        phone: phone || null,
        address: address || null,
        classId: classId || null,
        rollNo: rollNo || null,
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