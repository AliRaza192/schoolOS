import { db } from "@/db";
import {
  schools,
  users,
  classes,
  students,
  attendance,
  fees,
  exams,
  examResults,
  timetableSlots,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  DEMO_SCHOOL,
  DEMO_CLASSES,
  DEMO_STUDENTS_PER_CLASS,
  DEMO_SUBJECTS,
  DEMO_FEE_AMOUNT,
} from "./demo-data";
import { calculateGrade } from "./exam-utils";

export async function generateDemoData(schoolAdminClerkId: string) {
  // Check if already seeded
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, schoolAdminClerkId),
  });

  if (existingUser?.schoolId) {
    return { alreadyExists: true, schoolId: existingUser.schoolId };
  }

  // Step 1: Create demo school
  const trialExpiry = new Date();
  trialExpiry.setDate(trialExpiry.getDate() + 14);

  const [school] = await db
    .insert(schools)
    .values({
      name: DEMO_SCHOOL.name,
      city: DEMO_SCHOOL.city,
      phone: DEMO_SCHOOL.phone,
      address: DEMO_SCHOOL.address,
      email: DEMO_SCHOOL.email,
      plan: "pro",
      isActive: true,
      planExpiresAt: trialExpiry,
    })
    .returning();

  // Step 2: Create admin user
  await db.insert(users).values({
    clerkId: schoolAdminClerkId,
    schoolId: school.id,
    name: "Demo Admin",
    email: "demo@schoolos.pk",
    role: "school_admin",
  });

  // Step 3: Create classes
  const createdClasses = [];
  for (const cls of DEMO_CLASSES) {
    const [created] = await db
      .insert(classes)
      .values({
        schoolId: school.id,
        name: cls.name,
        section: cls.section,
        academicYear: cls.academicYear,
        isActive: true,
      })
      .returning();
    createdClasses.push(created);
  }

  // Step 4: Create students
  const createdStudents: { id: string; classIndex: number }[] = [];
  for (let ci = 0; ci < createdClasses.length; ci++) {
    const classStudents = DEMO_STUDENTS_PER_CLASS[ci];
    for (const student of classStudents) {
      const [created] = await db
        .insert(students)
        .values({
          schoolId: school.id,
          classId: createdClasses[ci].id,
          name: student.name,
          fatherName: student.fatherName,
          rollNo: student.rollNo,
          admissionDate: new Date().toISOString().split("T")[0],
          isActive: true,
        })
        .returning();
      createdStudents.push({ id: created.id, classIndex: ci });
    }
  }

  // Step 5: Generate last 30 days attendance
  let attendanceCount = 0;
  const today = new Date();

  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // Skip Sunday

    const dateStr = date.toISOString().split("T")[0];

    for (const student of createdStudents) {
      // 2-3 students with low attendance
      const isLowAttendance = parseInt(student.id.slice(-1), 16) % 10 < 2;
      const rand = Math.random();
      let status: "present" | "absent" | "leave";

      if (isLowAttendance) {
        status = rand < 0.65 ? "present" : rand < 0.85 ? "absent" : "leave";
      } else {
        status = rand < 0.9 ? "present" : rand < 0.97 ? "absent" : "leave";
      }

      await db
        .insert(attendance)
        .values({
          studentId: student.id,
          classId: createdClasses[student.classIndex].id,
          schoolId: school.id,
          date: dateStr,
          status,
        })
        .onConflictDoNothing();

      attendanceCount++;
    }
  }

  // Step 6: Generate fees (last 3 months)
  let feeCount = 0;
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  for (let m = 2; m >= 0; m--) {
    let month = currentMonth - m;
    let year = currentYear;
    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    for (const student of createdStudents) {
      const rand = Math.random();
      const status: "paid" | "pending" | "overdue" =
        rand < 0.7 ? "paid" : rand < 0.9 ? "pending" : "overdue";

      const dueDate = new Date(year, month - 1, 10).toISOString().split("T")[0];

      await db
        .insert(fees)
        .values({
          studentId: student.id,
          schoolId: school.id,
          month,
          year,
          amount: String(DEMO_FEE_AMOUNT),
          dueDate,
          paidAmount: status === "paid" ? String(DEMO_FEE_AMOUNT) : null,
          paidAt: status === "paid" ? new Date() : null,
          status,
        })
        .onConflictDoNothing();

      feeCount++;
    }
  }

  // Step 7: Generate exams
  let examResultCount = 0;

  for (let ci = 0; ci < createdClasses.length; ci++) {
    const classStudents = createdStudents.filter((s) => s.classIndex === ci);

    for (const examConfig of [
      { name: "Mid Term", daysAgo: 60 },
      { name: "Monthly Test", daysAgo: 30 },
    ]) {
      const examDate = new Date(today);
      examDate.setDate(today.getDate() - examConfig.daysAgo);
      const examDateStr = examDate.toISOString().split("T")[0];

      const totalMarks = DEMO_SUBJECTS.length * 100;

      const [exam] = await db
        .insert(exams)
        .values({
          schoolId: school.id,
          classId: createdClasses[ci].id,
          name: examConfig.name,
          totalMarks: String(totalMarks),
          examDate: examDateStr,
          subjects: JSON.stringify(DEMO_SUBJECTS),
          isActive: true,
        })
        .returning();

      // Results for each student
      const examResultsData = [];
      for (const student of classStudents) {
        const subjectResults = DEMO_SUBJECTS.map((subject) => {
          const baseMark = 55 + Math.random() * 40;
          const marks = Math.round(baseMark);
          return { subject, marks, totalMarks: 100, grade: calculateGrade((marks / 100) * 100) };
        });

        const totalObtained = subjectResults.reduce((sum, s) => sum + s.marks, 0);
        const percentage = Math.round((totalObtained / totalMarks) * 100 * 10) / 10;
        const grade = calculateGrade(percentage);

        examResultsData.push({
          examId: exam.id,
          studentId: student.id,
          schoolId: school.id,
          subjectResults: JSON.stringify(subjectResults),
          totalObtained: String(totalObtained),
          totalPossible: String(totalMarks),
          percentage: String(percentage),
          grade,
          position: 0,
          remarks: null,
        });
      }

      await db.insert(examResults).values(examResultsData).onConflictDoNothing();
      examResultCount += examResultsData.length;
    }
  }

  // Step 8: Generate timetable
  const PERIODS = 8;
  const PERIOD_DURATION = 45;
  const BREAK_AFTER = 4;
  const BREAK_DURATION = 20;
  const WORKING_DAYS = [1, 2, 3, 4, 5, 6];

  for (const cls of createdClasses) {
    for (const day of WORKING_DAYS) {
      let hours = 8;
      let minutes = 0;

      for (let p = 1; p <= PERIODS; p++) {
        const startTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        let endMin = minutes + PERIOD_DURATION;
        let endHour = hours + Math.floor(endMin / 60);
        endMin = endMin % 60;
        const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

        const subject = DEMO_SUBJECTS[(p - 1) % DEMO_SUBJECTS.length];

        await db
          .insert(timetableSlots)
          .values({
            schoolId: school.id,
            classId: cls.id,
            dayOfWeek: day,
            periodNumber: p,
            startTime,
            endTime,
            subject,
          })
          .onConflictDoNothing();

        hours = endHour;
        minutes = endMin;

        if (p === BREAK_AFTER) {
          minutes += BREAK_DURATION;
          if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
          }
        }
      }
    }
  }

  return {
    success: true,
    schoolId: school.id,
    stats: {
      students: createdStudents.length,
      classes: createdClasses.length,
      attendanceRecords: attendanceCount,
      feeRecords: feeCount,
      examResults: examResultCount,
    },
  };
}