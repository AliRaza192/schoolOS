"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "@/components/dashboard/sidebar";

interface HeaderProps {
  title: string;
  schoolName: string;
  schoolPlan: string;
  userName: string;
}

export default function Header({
  title,
  schoolName,
  schoolPlan,
  userName,
}: HeaderProps) {
  return (
    <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200">
      {/* Mobile Hamburger */}
      <Sheet>
        <SheetTrigger className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar
            schoolName={schoolName}
            schoolPlan={schoolPlan}
            userName={userName}
          />
        </SheetContent>
      </Sheet>

      {/* Page Title */}
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </header>
  );
}