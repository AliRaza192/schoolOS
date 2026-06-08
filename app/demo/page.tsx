import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  CreditCard,
  BookOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "SchoolOS Demo - Live Preview",
  description:
    "SchoolOS ka live demo dekhein. Dashboard, attendance, fees, reports sab kuch preview karein.",
};

const DEMO_STATS = {
  totalStudents: 247,
  todayAttendance: { present: 198, total: 247, percentage: 80 },
  pendingFees: 34,
  totalClasses: 12,
};

const DEMO_STUDENTS = [
  { name: "Ahmed Ali", father: "Muhammad Ali", class: "5th A", roll: "001", status: "present" },
  { name: "Fatima Khan", father: "Asad Khan", class: "5th A", roll: "002", status: "present" },
  { name: "Hassan Raza", father: "Imran Raza", class: "5th A", roll: "003", status: "absent" },
  { name: "Ayesha Siddiqui", father: "Tariq Siddiqui", class: "5th A", roll: "004", status: "present" },
  { name: "Omar Farooq", father: "Farooq Ahmed", class: "5th A", roll: "005", status: "leave" },
];

const DEMO_FEES = [
  { student: "Ahmed Ali", class: "5th A", amount: "Rs. 3,000", status: "paid", month: "May 2026" },
  { student: "Fatima Khan", class: "5th A", amount: "Rs. 3,000", status: "pending", month: "May 2026" },
  { student: "Hassan Raza", class: "5th A", amount: "Rs. 3,000", status: "overdue", month: "Apr 2026" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SchoolOS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-700">Demo Mode</Badge>
            <Link href="/sign-up">
              <Button size="sm">
                Free Trial
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Demo Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            SchoolOS Demo Dashboard
          </h1>
          <p className="text-blue-700">
            Yeh demo hai — asli product mein aapka apna school data hoga.{" "}
            <Link href="/sign-up" className="underline font-medium">
              Free trial start karein
            </Link>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              title: "Total Students",
              value: DEMO_STATS.totalStudents,
              icon: Users,
              color: "text-blue-600 bg-blue-50",
            },
            {
              title: "Aaj ki Hazri",
              value: `${DEMO_STATS.todayAttendance.percentage}%`,
              icon: CalendarCheck,
              color: "text-green-600 bg-green-50",
            },
            {
              title: "Pending Fees",
              value: DEMO_STATS.pendingFees,
              icon: CreditCard,
              color: "text-amber-600 bg-amber-50",
            },
            {
              title: "Total Classes",
              value: DEMO_STATS.totalClasses,
              icon: BookOpen,
              color: "text-purple-600 bg-purple-50",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{stat.title}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Attendance Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Attendance — 5th A — Today
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Roll</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Father</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_STUDENTS.map((s) => (
                  <tr key={s.roll} className="border-b border-gray-50">
                    <td className="py-3 px-3 text-gray-600">{s.roll}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 px-3 text-gray-600">{s.father}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          s.status === "present"
                            ? "bg-green-100 text-green-700"
                            : s.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {s.status === "present"
                          ? "✓ Present"
                          : s.status === "absent"
                            ? "✗ Absent"
                            : "~ Leave"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fees Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Fee Status — May 2026
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Student</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Class</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_FEES.map((f, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">{f.student}</td>
                    <td className="py-3 px-3 text-gray-600">{f.class}</td>
                    <td className="py-3 px-3 text-gray-600">{f.amount}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          f.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : f.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {f.status === "paid"
                          ? "✓ Paid"
                          : f.status === "pending"
                            ? "⏳ Pending"
                            : "⚠ Overdue"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Apna School Digital Banayein
          </h2>
          <p className="text-blue-100 mb-6">
            14 din free trial — koi credit card nahi chahiye
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Free Trial Start Karein
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
