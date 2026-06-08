import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name kam az kam 2 characters").max(255),
  fatherName: z.string().max(255).optional().or(z.literal("")),
  classId: z.string().uuid("Class select karo"),
  rollNo: z.string().max(20).optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^03[0-9]{2}-?[0-9]{7}$/, "Format: 03XX-XXXXXXX")
    .optional()
    .or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  admissionDate: z.string(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;