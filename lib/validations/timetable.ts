import { z } from "zod";

export const timetableSlotSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  dayOfWeek: z.number().min(1).max(6),
  periodNumber: z.number().min(1).max(8),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format hona chahiye: HH:MM"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format hona chahiye: HH:MM"),
  subject: z.string().min(2).max(100),
  teacherId: z.string().uuid().optional().or(z.literal("")),
  room: z.string().max(50).optional().or(z.literal("")),
}).refine(
  (data) => data.endTime > data.startTime,
  { message: "End time start time se baad hona chahiye", path: ["endTime"] }
);

export const bulkTimetableSchema = z.object({
  classId: z.string().uuid(),
  slots: z.array(timetableSlotSchema).min(1),
});

export const homeworkSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  subject: z.string().min(2, "Subject min 2 characters"),
  title: z.string().min(3, "Title min 3 characters").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  assignedDate: z
    .string()
    .default(() => new Date().toISOString().split("T")[0]),
  dueDate: z.string().min(1, "Due date required"),
}).refine(
  (data) => data.dueDate >= data.assignedDate,
  { message: "Due date assigned date se pehle nahi ho sakti", path: ["dueDate"] }
);

export type TimetableSlotValues = z.infer<typeof timetableSlotSchema>;
export type BulkTimetableValues = z.infer<typeof bulkTimetableSchema>;
export type HomeworkValues = z.infer<typeof homeworkSchema>;