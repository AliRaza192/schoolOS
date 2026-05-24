import { z } from "zod";

export const createFeeSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  amount: z.number().positive("Amount positive hona chahiye"),
  dueDate: z.string().optional().or(z.literal("")),
});

export const bulkCreateFeeSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  amount: z.number().positive("Amount positive hona chahiye"),
  dueDate: z.string().optional().or(z.literal("")),
});

export const markPaidSchema = z.object({
  id: z.string().uuid("Invalid fee ID"),
  paidAmount: z.number().positive("Paid amount positive hona chahiye"),
  paymentDate: z.string().min(1, "Payment date required"),
  receiptNo: z.string().max(50).optional().or(z.literal("")),
});

export type CreateFeeValues = z.infer<typeof createFeeSchema>;
export type BulkCreateFeeValues = z.infer<typeof bulkCreateFeeSchema>;
export type MarkPaidValues = z.infer<typeof markPaidSchema>;