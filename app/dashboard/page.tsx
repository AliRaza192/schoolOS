"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, CreditCard, BookOpen } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  totalStudents: number;
  todayAttendance: {
    presentCount: number;
    totalMarked: number;
    percentage: number;
  };
  pendingFees: number;
  totalClasses: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const isEmpty =
    !isLoading &&
    stats?.totalStudents === 0 &&
    stats?.totalClasses === 0 &&
    stats?.pendingFees === 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          label="Registered Students"
          icon={Users}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Aaj ki Hazri"
          value={
            stats?.todayAttendance.totalMarked === 0
              ? "—"
              : `${stats?.todayAttendance.percentage}%`
          }
          label="Aaj ki Hazri"
          icon={CalendarCheck}
          color="green"
          subLabel={
            stats?.todayAttendance.totalMarked === 0
              ? "Abhi tak nahi li"
              : `${stats?.todayAttendance.presentCount}/${stats?.todayAttendance.totalMarked} present`
          }
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Fees"
          value={stats?.pendingFees ?? 0}
          label="Pending Fees"
          icon={CreditCard}
          color="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses ?? 0}
          label="Active Classes"
          icon={BookOpen}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Shuruaat karo!
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Pehle ek class banao, phir students add karo.
          </p>
          <Button onClick={() => window.location.href = "/dashboard/students"}>
  Class Add Karo
</Button>
        </div>
      )}
    </div>
  );
}