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