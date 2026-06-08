import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name kam az kam 2 characters"),
  fatherName: z.string().optional().or(z.literal("")),
  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d{1}$/, "Format: XXXXX-XXXXXXX-X")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  designation: z.string().min(1, "Designation required"),
  department: z.string().optional().or(z.literal("")),
  joiningDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  basicSalary: z.number().positive("Salary positive honi chahiye"),
  branchId: z.string().uuid().optional().or(z.literal("")),
});

export const salaryStructureSchema = z.object({
  basicSalary: z.number().positive("Basic salary required"),
  houseRent: z.number().min(0).default(0),
  medicalAllowance: z.number().min(0).default(0),
  transportAllowance: z.number().min(0).default(0),
  otherAllowances: z.number().min(0).default(0),
  providentFund: z.number().min(0).default(0),
  incomeTax: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  effectiveFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
});

export const processPayrollSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  staffIds: z.array(z.string().uuid()).optional(),
  workingDays: z.number().min(1).max(31),
});

export const leaveRequestSchema = z.object({
  staffId: z.string().uuid("Invalid staff ID"),
  leaveType: z.enum(["sick", "casual", "annual", "unpaid"]),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  reason: z.string().optional().or(z.literal("")),
});

export const approveLeaveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  remarks: z.string().optional().or(z.literal("")),
});

export type CreateStaffValues = z.infer<typeof createStaffSchema>;
export type SalaryStructureValues = z.infer<typeof salaryStructureSchema>;
export type ProcessPayrollValues = z.infer<typeof processPayrollSchema>;
export type LeaveRequestValues = z.infer<typeof leaveRequestSchema>;
export type ApproveLeaveValues = z.infer<typeof approveLeaveSchema>;
