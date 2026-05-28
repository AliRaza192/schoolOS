export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  actionLabel: string;
  checkFn: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "add_class",
    title: "Pehli Class Banao",
    description: "Apni school ki ek class add karo",
    icon: "BookOpen",
    action: "/dashboard/students/classes",
    actionLabel: "Class Banao",
    checkFn: "hasClasses",
  },
  {
    id: "add_students",
    title: "Students Enroll Karo",
    description: "Kam az kam 3 students add karo",
    icon: "Users",
    action: "/dashboard/students",
    actionLabel: "Students Add Karo",
    checkFn: "hasStudents",
  },
  {
    id: "mark_attendance",
    title: "Pehli Attendance Lo",
    description: "Aaj ki attendance mark karo",
    icon: "CalendarCheck",
    action: "/dashboard/attendance",
    actionLabel: "Attendance Lao",
    checkFn: "hasAttendance",
  },
  {
    id: "generate_fees",
    title: "Fees Generate Karo",
    description: "Is month ki fees create karo",
    icon: "CreditCard",
    action: "/dashboard/fees",
    actionLabel: "Fees Banao",
    checkFn: "hasFees",
  },
  {
    id: "explore_reports",
    title: "AI Report Card Dekhein",
    description: "AI se report card generate karo",
    icon: "Sparkles",
    action: "/dashboard/reports",
    actionLabel: "Reports Dekhain",
    checkFn: "hasReports",
  },
];