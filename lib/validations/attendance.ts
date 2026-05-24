import { z } from "zod";

export const markAttendanceSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format hona chahiye: YYYY-MM-DD"),
  records: z.array(
    z.object({
      studentId: z.string().uuid("Invalid student ID"),
      status: z.enum(["present", "absent", "leave"]),
    })
  ).min(1, "Kam az kam ek student hona chahiye"),
});

export const updateAttendanceSchema = z.object({
  id: z.string().uuid("Invalid attendance ID"),
  status: z.enum(["present", "absent", "leave"]),
});

export type MarkAttendanceValues = z.infer<typeof markAttendanceSchema>;
export type UpdateAttendanceValues = z.infer<typeof updateAttendanceSchema>;