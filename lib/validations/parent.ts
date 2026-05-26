import { z } from "zod";

export const linkParentSchema = z.object({
  parentEmail: z.string().email("Valid email required"),
  studentId: z.string().uuid("Invalid student ID"),
});

export const sendNotificationSchema = z.object({
  title: z.string().min(3).max(255),
  message: z.string().min(10).max(1000),
  targetType: z.enum(["all", "class", "student"]),
  classId: z.string().uuid().optional().or(z.literal("")),
  studentId: z.string().uuid().optional().or(z.literal("")),
  sendVia: z.enum(["whatsapp", "email", "both"]),
});

export type LinkParentValues = z.infer<typeof linkParentSchema>;
export type SendNotificationValues = z.infer<typeof sendNotificationSchema>;