import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, students, classes, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { markAttendanceSchema } from "@/lib/validations/attendance";

async function getUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
}

// GET — fetch attendance for a class on a date
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");

    if (!classId || !date) {
      return NextResponse.json(
        { error: "classId aur date required hain" },
        { status: 400 }
      );
    }

    // Verify class belongs to school
    const classRecord = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, classId),
        eq(classes.schoolId, user.schoolId)
      ),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Fetch active students in this class
    const classStudents = await db.query.students.findMany({
      where: and(
        eq(students.classId, classId),
        eq(students.schoolId, user.schoolId),
        eq(students.isActive, true)
      ),
      orderBy: students.rollNo,
    });

    // Fetch attendance records for this date
    const attendanceRecords = await db.query.attendance.findMany({
      where: and(
        eq(attendance.classId, classId),
        eq(attendance.schoolId, user.schoolId),
        eq(attendance.date, date)
      ),
    });

    // Merge students with attendance
    const merged = classStudents.map((student) => {
      const record = attendanceRecords.find(
        (a) => a.studentId === student.id
      );
      return {
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        attendanceId: record?.id ?? null,
        status: record?.status ?? null,
      };
    });

    const present = merged.filter((s) => s.status === "present").length;
    const absent = merged.filter((s) => s.status === "absent").length;
    const leave = merged.filter((s) => s.status === "leave").length;
    const unmarked = merged.filter((s) => s.status === null).length;

    return NextResponse.json({
      date,
      classId,
      className: `${classRecord.name}${classRecord.section ? ` (${classRecord.section})` : ""}`,
      isMarked: attendanceRecords.length > 0,
      students: merged,
      summary: {
        total: merged.length,
        present,
        absent,
        leave,
        unmarked,
      },
    });
  } catch (error) {
    console.error("[ATTENDANCE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — bulk mark attendance
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUser(userId);
    if (!user?.schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const body = await req.json();
    const validated = markAttendanceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { classId, date, records } = validated.data;

    // Verify class ownership
    const classRecord = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, classId),
        eq(classes.schoolId, user.schoolId)
      ),
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Upsert attendance records
    const values = records.map((record) => ({
      studentId: record.studentId,
      classId,
      schoolId: user.schoolId!,
      date,
      status: record.status,
      markedByUserId: user.id,
    }));

    await db
      .insert(attendance)
      .values(values)
      .onConflictDoUpdate({
        target: [attendance.studentId, attendance.date],
        set: {
          status: attendance.status,
          markedByUserId: user.id,
        },
      });

    return NextResponse.json({ success: true, marked: records.length });
  } catch (error) {
    console.error("[ATTENDANCE_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}