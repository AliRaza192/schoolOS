import { z } from 'zod'

export const onboardingSchema = z.object({
  schoolName: z
    .string()
    .min(3, 'School name kam az kam 3 characters ka hona chahiye')
    .max(255, 'School name bahut lamba hai'),
  city: z.enum([
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Other',
  ], { required_error: 'City select karo' }),
  phone: z
    .string()
    .regex(/^03\d{2}-?\d{7}$/, 'Phone format: 03XX-XXXXXXX')
    .optional()
    .or(z.literal('')),
  address: z.string().max(500).optional(),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>