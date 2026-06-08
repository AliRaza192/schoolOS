import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(3, "Name kam az kam 3 characters ka hona chahiye").max(255),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  isMainBranch: z.boolean().optional().default(false),
});

export const updateBranchSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

export const assignBranchManagerSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  branchId: z.string().uuid("Invalid branch ID"),
});

export const transferStudentSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  fromBranchId: z.string().uuid("Invalid source branch ID"),
  toBranchId: z.string().uuid("Invalid destination branch ID"),
  transferDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format hona chahiye: YYYY-MM-DD"),
  reason: z.string().max(500).optional(),
  newClassId: z.string().uuid("Invalid class ID").optional(),
});

export type CreateBranchValues = z.infer<typeof createBranchSchema>;
export type UpdateBranchValues = z.infer<typeof updateBranchSchema>;
export type AssignBranchManagerValues = z.infer<typeof assignBranchManagerSchema>;
export type TransferStudentValues = z.infer<typeof transferStudentSchema>;
