import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  decimal,
  integer,
  unique,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────
export const planEnum = pgEnum("plan", ["basic", "pro", "academy"]);
export const roleEnum = pgEnum("role", [
  "super_admin",
  "school_admin",
  "teacher",
  "parent",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "leave",
]);
export const feeStatusEnum = pgEnum("fee_status", [
  "pending",
  "paid",
  "partial",
  "overdue",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "easypaisa",
  "jazzcash",
  "bank_transfer",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "expired",
  "cancelled",
]);

// ─── Schools ─────────────────────────────────────────────
export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  plan: planEnum("plan").default("basic").notNull(),
  planExpiresAt: timestamp("plan_expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  schoolId: uuid("school_id").references(() => schools.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: roleEnum("role").default("school_admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Classes ─────────────────────────────────────────────
export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  section: varchar("section", { length: 10 }),
  teacherId: uuid("teacher_id").references(() => users.id),
  academicYear: varchar("academic_year", { length: 9 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Students ────────────────────────────────────────────
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  classId: uuid("class_id").references(() => classes.id),
  rollNo: varchar("roll_no", { length: 20 }),
  name: varchar("name", { length: 255 }).notNull(),
  fatherName: varchar("father_name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  dob: date("dob"),
  admissionDate: date("admission_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Attendance ──────────────────────────────────────────
export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),
    classId: uuid("class_id")
      .references(() => classes.id)
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    date: date("date").notNull(),
    status: attendanceStatusEnum("status").notNull(),
    markedByUserId: uuid("marked_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueStudentDate: unique().on(table.studentId, table.date),
  })
);

// ─── Fees ────────────────────────────────────────────────
export const fees = pgTable(
  "fees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: date("due_date"),
    paidAt: timestamp("paid_at"),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }),
    status: feeStatusEnum("status").default("pending").notNull(),
    receiptNo: varchar("receipt_no", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueStudentMonthYear: unique().on(table.studentId, table.month, table.year),
  })
);

// ─── Subscriptions ───────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  plan: planEnum("plan").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentProof: text("payment_proof"),
  status: subscriptionStatusEnum("status").default("pending").notNull(),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notification Enums ──────────────────────────────────
export const notificationTypeEnum = pgEnum("notification_type", [
  "attendance", "fee", "general", "result",
]);
export const sentViaEnum = pgEnum("sent_via", [
  "whatsapp", "email", "both",
]);

// ─── Parent Students (many-to-many) ─────────────────────
export const parentStudents = pgTable(
  "parent_students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentUserId: uuid("parent_user_id")
      .references(() => users.id)
      .notNull(),
    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueParentStudent: unique().on(table.parentUserId, table.studentId),
  })
);

// ─── Notifications ───────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  studentId: uuid("student_id").references(() => students.id),
  classId: uuid("class_id").references(() => classes.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull(),
  sentVia: sentViaEnum("sent_via").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  sentByUserId: uuid("sent_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Parent Students Relations ───────────────────────────
export const parentStudentsRelations = relations(
  parentStudents,
  ({ one }) => ({
    parent: one(users, {
      fields: [parentStudents.parentUserId],
      references: [users.id],
    }),
    student: one(students, {
      fields: [parentStudents.studentId],
      references: [students.id],
    }),
    school: one(schools, {
      fields: [parentStudents.schoolId],
      references: [schools.id],
    }),
  })
);

// ─── Notifications Relations ─────────────────────────────
export const notificationsRelations = relations(
  notifications,
  ({ one }) => ({
    school: one(schools, {
      fields: [notifications.schoolId],
      references: [schools.id],
    }),
    student: one(students, {
      fields: [notifications.studentId],
      references: [students.id],
    }),
    class: one(classes, {
      fields: [notifications.classId],
      references: [classes.id],
    }),
    sentBy: one(users, {
      fields: [notifications.sentByUserId],
      references: [users.id],
    }),
  })
);

// Types
export type ParentStudent = typeof parentStudents.$inferSelect;
export type NewParentStudent = typeof parentStudents.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ─── Types ───────────────────────────────────────────────
export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type Fee = typeof fees.$inferSelect;
export type NewFee = typeof fees.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;


// ─── Relations ───────────────────────────────────────────
import { relations } from "drizzle-orm";

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  classes: many(classes),
  students: many(students),
  attendance: many(attendance),
  fees: many(fees),
  subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({ one }) => ({
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, {
    fields: [classes.schoolId],
    references: [schools.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  students: many(students),
  attendance: many(attendance),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, {
    fields: [students.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  attendance: many(attendance),
  fees: many(fees),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  school: one(schools, {
    fields: [attendance.schoolId],
    references: [schools.id],
  }),
}));

export const feesRelations = relations(fees, ({ one }) => ({
  student: one(students, {
    fields: [fees.studentId],
    references: [students.id],
  }),
  school: one(schools, {
    fields: [fees.schoolId],
    references: [schools.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  school: one(schools, {
    fields: [subscriptions.schoolId],
    references: [schools.id],
  }),
}));



// ─── Exams ───────────────────────────────────────────────
export const exams = pgTable("exams", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  classId: uuid("class_id")
    .references(() => classes.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  totalMarks: decimal("total_marks", { precision: 6, scale: 2 }).notNull(),
  examDate: date("exam_date").notNull(),
  subjects: text("subjects").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Exam Results ─────────────────────────────────────────
export const examResults = pgTable(
  "exam_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    examId: uuid("exam_id")
      .references(() => exams.id)
      .notNull(),
    studentId: uuid("student_id")
      .references(() => students.id)
      .notNull(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    subjectResults: text("subject_results").notNull(),
    totalObtained: decimal("total_obtained", { precision: 6, scale: 2 }).notNull(),
    totalPossible: decimal("total_possible", { precision: 6, scale: 2 }).notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
    grade: varchar("grade", { length: 5 }),
    position: integer("position"),
    remarks: text("remarks"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueExamStudent: unique().on(table.examId, table.studentId),
  })
);

// ─── Exams Relations ─────────────────────────────────────
export const examsRelations = relations(exams, ({ one, many }) => ({
  school: one(schools, {
    fields: [exams.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [exams.classId],
    references: [classes.id],
  }),
  results: many(examResults),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id],
  }),
  student: one(students, {
    fields: [examResults.studentId],
    references: [students.id],
  }),
  school: one(schools, {
    fields: [examResults.schoolId],
    references: [schools.id],
  }),
}));

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
export type ExamResult = typeof examResults.$inferSelect;
export type NewExamResult = typeof examResults.$inferInsert;


// ─── Timetable Slots ─────────────────────────────────────
export const timetableSlots = pgTable(
  "timetable_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    schoolId: uuid("school_id")
      .references(() => schools.id)
      .notNull(),
    classId: uuid("class_id")
      .references(() => classes.id)
      .notNull(),
    dayOfWeek: integer("day_of_week").notNull(),
    periodNumber: integer("period_number").notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    subject: varchar("subject", { length: 100 }).notNull(),
    teacherId: uuid("teacher_id").references(() => users.id),
    room: varchar("room", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueClassDayPeriod: unique().on(
      table.classId,
      table.dayOfWeek,
      table.periodNumber
    ),
  })
);

// ─── Homework ─────────────────────────────────────────────
export const homework = pgTable("homework", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolId: uuid("school_id")
    .references(() => schools.id)
    .notNull(),
  classId: uuid("class_id")
    .references(() => classes.id)
    .notNull(),
  teacherId: uuid("teacher_id")
    .references(() => users.id)
    .notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedDate: date("assigned_date").notNull(),
  dueDate: date("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Timetable Relations ──────────────────────────────────
export const timetableSlotsRelations = relations(
  timetableSlots,
  ({ one }) => ({
    school: one(schools, {
      fields: [timetableSlots.schoolId],
      references: [schools.id],
    }),
    class: one(classes, {
      fields: [timetableSlots.classId],
      references: [classes.id],
    }),
    teacher: one(users, {
      fields: [timetableSlots.teacherId],
      references: [users.id],
    }),
  })
);

export const homeworkRelations = relations(homework, ({ one }) => ({
  school: one(schools, {
    fields: [homework.schoolId],
    references: [schools.id],
  }),
  class: one(classes, {
    fields: [homework.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [homework.teacherId],
    references: [users.id],
  }),
}));

export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type NewTimetableSlot = typeof timetableSlots.$inferInsert;
export type Homework = typeof homework.$inferSelect;
export type NewHomework = typeof homework.$inferInsert;