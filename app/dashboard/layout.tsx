import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { headers } from "next/headers";


interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: {
      school: true,
    },
  });

  if (!user) {
    redirect("/onboarding");
  }

  if (!user.schoolId || !user.school) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — Desktop only */}
      <div className="hidden md:flex">
        <Sidebar
          schoolName={user.school.name}
          schoolPlan={user.school.plan}
          userName={user.name}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="SchoolOS"
          schoolName={user.school.name}
          schoolPlan={user.school.plan}
          userName={user.name}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}