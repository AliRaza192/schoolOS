import { z } from "zod";

export const classSchema = z.object({
  name: z
    .string()
    .min(1, "Class name required")
    .max(100, "Class name too long"),
  section: z
    .string()
    .max(10, "Section too long")
    .optional()
    .or(z.literal("")),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format hona chahiye: YYYY-YYYY")
    .default("2024-2025"),
  teacherId: z.string().uuid("Invalid teacher").optional().or(z.literal("")),
});

export type ClassFormValues = z.infer<typeof classSchema>;