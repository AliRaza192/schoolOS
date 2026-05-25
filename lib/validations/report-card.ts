import { z } from "zod";

export const generateReportSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  teacherNote: z.string().max(200).optional().or(z.literal("")),
});

export const singleReportSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  teacherNote: z.string().max(200).optional().or(z.literal("")),
});

export type GenerateReportValues = z.infer<typeof generateReportSchema>;
export type SingleReportValues = z.infer<typeof singleReportSchema>;