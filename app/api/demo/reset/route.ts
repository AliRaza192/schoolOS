import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  schools,
  students,
  classes,
  attendance,
  fees,
  exams,
  examResults,
  timetableSlots,
  users,
} from "@/db/schema";
import { eq, like, lt, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    // Find old demo schools
    const demoSchools = await db.query.schools.findMany({
      where: and(
        like(schools.name, "%(Demo)%"),
        lt(schools.createdAt, cutoff)
      ),
    });

    let deleted = 0;

    for (const school of demoSchools) {
      // Delete in order (foreign keys)
      const schoolStudents = await db.query.students.findMany({
        where: eq(students.schoolId, school.id),
      });

      const studentIds = schoolStudents.map((s) => s.id);

      // Delete exam results
      for (const studentId of studentIds) {
        await db
          .delete(examResults)
          .where(eq(examResults.studentId, studentId));
      }

      // Delete exams
      const schoolExams = await db.query.exams.findMany({
        where: eq(exams.schoolId, school.id),
      });
      for (const exam of schoolExams) {
        await db.delete(exams).where(eq(exams.id, exam.id));
      }

      // Delete attendance, fees, timetable
      await db.delete(attendance).where(eq(attendance.schoolId, school.id));
      await db.delete(fees).where(eq(fees.schoolId, school.id));
      await db.delete(timetableSlots).where(eq(timetableSlots.schoolId, school.id));

      // Delete students
      await db.delete(students).where(eq(students.schoolId, school.id));

      // Delete classes
      await db.delete(classes).where(eq(classes.schoolId, school.id));

      // Delete users
      await db.delete(users).where(eq(users.schoolId, school.id));

      // Delete school
      await db.delete(schools).where(eq(schools.id, school.id));

      deleted++;
    }

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("[DEMO_RESET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}