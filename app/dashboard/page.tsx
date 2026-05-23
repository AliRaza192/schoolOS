import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, students, attendance, fees } from "@/db/schema";
import { eq, count, and, sql } from "drizzle-orm";
import {
  Users,
  ClipboardList,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats(schoolId: string) {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [
    totalStudents,
    todayPresent,
    pendingFees,
    paidThisMonth,
  ] = await Promise.all([
    // Total active students
    db
      .select({ count: count() })
      .from(students)
      .where(and(eq(students.schoolId, schoolId), eq(students.isActive, true))),

    // Today's present count
    db
      .select({ count: count() })
      .from(attendance)
      .where(
        and(
          eq(attendance.schoolId, schoolId),
          eq(attendance.date, today),
          eq(attendance.status, "present")
        )
      ),

    // Pending fees this month
    db
      .select({ count: count() })
      .from(fees)
      .where(
        and(
          eq(fees.schoolId, schoolId),
          eq(fees.status, "pending"),
          eq(fees.month, currentMonth),
          eq(fees.year, currentYear)
        )
      ),

    // Paid fees amount this month
    db
      .select({
        total: sql<number>`COALESCE(SUM(${fees.paidAmount}), 0)`,
      })
      .from(fees)
      .where(
        and(
          eq(fees.schoolId, schoolId),
          eq(fees.status, "paid"),
          eq(fees.month, currentMonth),
          eq(fees.year, currentYear)
        )
      ),
  ]);

  return {
    totalStudents: totalStudents[0]?.count ?? 0,
    todayPresent: todayPresent[0]?.count ?? 0,
    pendingFees: pendingFees[0]?.count ?? 0,
    paidThisMonth: paidThisMonth[0]?.total ?? 0,
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { school: true },
  });

  if (!user?.schoolId) redirect("/onboarding");

  const stats = await getDashboardStats(user.schoolId);

  const attendanceRate =
    stats.totalStudents > 0
      ? Math.round((stats.todayPresent / stats.totalStudents) * 100)
      : 0;

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Active enrolled students",
    },
    {
      title: "Present Today",
      value: stats.todayPresent,
      icon: ClipboardList,
      color: "text-green-600",
      bg: "bg-green-50",
      description: `${attendanceRate}% attendance rate`,
    },
    {
      title: "Pending Fees",
      value: stats.pendingFees,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      description: "Students with unpaid fees",
    },
    {
      title: "Collected This Month",
      value: `Rs. ${Number(stats.paidThisMonth).toLocaleString("en-PK")}`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Fee collection this month",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user.school?.name} —{" "}
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="capitalize bg-blue-50 text-blue-700"
        >
          {user.school?.plan} Plan
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-dashed border-2 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
            <Users className="w-8 h-8 text-blue-400" />
            <p className="font-medium text-gray-700">Add Student</p>
            <p className="text-xs text-gray-400">Enroll a new student</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
            <ClipboardList className="w-8 h-8 text-green-400" />
            <p className="font-medium text-gray-700">Mark Attendance</p>
            <p className="text-xs text-gray-400">Take today's attendance</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <p className="font-medium text-gray-700">Collect Fee</p>
            <p className="text-xs text-gray-400">Record a fee payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State — No Students Yet */}
      {stats.totalStudents === 0 && (
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              No students yet
            </h3>
            <p className="text-gray-500 text-sm text-center max-w-sm">
              Start by adding your first student. You can also import students
              in bulk from a CSV file.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}