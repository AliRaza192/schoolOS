"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { School } from "@/db/schema";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: ClipboardList,
  },
  {
    label: "Fees",
    href: "/dashboard/fees",
    icon: DollarSign,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    badge: "AI",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  school: School | null;
}

export default function Sidebar({ school }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-gray-900 text-sm truncate">
              {school?.name ?? "SchoolOS"}
            </p>
            <p className="text-xs text-gray-400 truncate">{school?.city}</p>
          </div>
        )}
      </div>

      {/* Plan Badge */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-gray-100">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium capitalize",
              school?.plan === "pro" && "bg-blue-100 text-blue-700",
              school?.plan === "academy" && "bg-purple-100 text-purple-700",
              school?.plan === "basic" && "bg-gray-100 text-gray-600"
            )}
          >
            {school?.plan ?? "basic"} plan
          </Badge>
        </div>
      )}

      {/* Nav Items */}
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
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 w-5 h-5",
                  isActive ? "text-blue-700" : "text-gray-400"
                )}
              />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-500" />
        )}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            SchoolOS Pakistan v1.0
          </p>
        </div>
      )}
    </aside>
  );
}