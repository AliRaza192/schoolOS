import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(3, "Exam name min 3 characters"),
  classId: z.string().uuid("Invalid class ID"),
  totalMarks: z.number().positive("Total marks positive hone chahiye"),
  examDate: z.string().min(1, "Exam date required"),
  subjects: z
    .array(z.string().min(2, "Subject name min 2 characters"))
    .min(1, "Kam az kam 1 subject hona chahiye")
    .max(10, "Max 10 subjects"),
});

export const subjectResultSchema = z.object({
  subject: z.string().min(1),
  marks: z.number().min(0, "Marks 0 se kam nahi ho sakte"),
  totalMarks: z.number().positive(),
});

export const enterResultSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().uuid(),
  subjectResults: z.array(subjectResultSchema).min(1),
});

export const bulkResultSchema = z.object({
  examId: z.string().uuid(),
  results: z.array(
    z.object({
      studentId: z.string().uuid(),
      subjectResults: z.array(subjectResultSchema).min(1),
    })
  ),
});

export type CreateExamValues = z.infer<typeof createExamSchema>;
export type EnterResultValues = z.infer<typeof enterResultSchema>;
export type BulkResultValues = z.infer<typeof bulkResultSchema>;