"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  FileText,
  Settings,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import { UserCheck, Bell, FileCheck } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { label: "Fees", href: "/dashboard/fees", icon: CreditCard },
  { label: "Exams", href: "/dashboard/exams", icon: FileCheck },
  { label: "Parents", href: "/dashboard/parents", icon: UserCheck },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Reports", href: "/dashboard/reports", icon: FileText, badge: "AI" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  schoolName: string;
  schoolPlan: string;
  userName: string;
}

export default function Sidebar({
  schoolName,
  schoolPlan,
  userName,
}: SidebarProps) {
  const pathname = usePathname();

  const planBadgeClass =
    schoolPlan === "pro"
      ? "bg-blue-100 text-blue-700"
      : schoolPlan === "academy"
        ? "bg-amber-100 text-amber-700"
        : "bg-gray-100 text-gray-600";

  return (
    <aside className="flex flex-col w-64 h-full bg-white border-r border-gray-200">
      {/* Top — School Info */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {schoolName?.charAt(0)?.toUpperCase() ?? "S"}
          </span>
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-gray-900 text-sm truncate">
            {schoolName}
          </p>
          <Badge
            className={cn(
              "text-xs font-medium capitalize mt-0.5",
              planBadgeClass,
            )}
          >
            {schoolPlan} plan
          </Badge>
        </div>
      </div>
      {/* Nav Links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="flex-shrink-0 w-5 h-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      // Bottom — User
      <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {userName?.charAt(0)?.toUpperCase() ?? "U"}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{userName}</p>
      </div>
    </aside>
  );
}
