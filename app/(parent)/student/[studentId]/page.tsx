"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "leave";
}

interface AttendanceSummary {
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}

interface FeeRecord {
  id: string;
  month: number;
  year: number;
  amount: string;
  paidAmount: string | null;
  status: string;
  paidAt: string | null;
  receiptNo: string | null;
}

type TabType = "attendance" | "fees";

export default function ParentStudentDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const currentMonth = String(new Date().getMonth() + 1);
  const currentYear = String(new Date().getFullYear());

  const [activeTab, setActiveTab] = useState<TabType>("attendance");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeSummary, setFeeSummary] = useState<{ totalPaid: number; totalPending: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    } else {
      fetchFees();
    }
  }, [activeTab, selectedMonth, selectedYear, studentId]);

  async function fetchAttendance() {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/parent/${studentId}/attendance?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      setAttendanceRecords(data.records ?? []);
      setAttendanceSummary(data.summary ?? null);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFees() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/parent/${studentId}/fees`);
      const data = await res.json();
      setFeeRecords(data.fees ?? []);
      setFeeSummary(data.summary ?? null);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  // Build calendar days
  function buildCalendar() {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, status: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const record = attendanceRecords.find((r) => r.date === dateStr);
      days.push({ day: d, status: record?.status ?? null });
    }

    return days;
  }

  function dayColor(status: string | null) {
    if (!status) return "bg-gray-100 text-gray-400";
    if (status === "present") return "bg-green-500 text-white";
    if (status === "absent") return "bg-red-500 text-white";
    return "bg-amber-400 text-white";
  }

  function feeStatusBadge(status: string) {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-700">Paid ✓</Badge>;
      case "pending": return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "partial": return <Badge className="bg-blue-100 text-blue-700">Partial</Badge>;
      case "overdue": return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/parent">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Student Details</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        {(["attendance", "fees"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "attendance" ? "Attendance" : "Fees"}
          </button>
        ))}
      </div>

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2023", "2024", "2025", "2026"].map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <>
              {/* Summary */}
              {attendanceSummary && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Present", value: attendanceSummary.present, color: "text-green-600" },
                    { label: "Absent", value: attendanceSummary.absent, color: "text-red-600" },
                    { label: "Leave", value: attendanceSummary.leave, color: "text-amber-600" },
                    { label: "%", value: `${attendanceSummary.percentage}%`, color: "text-blue-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                      <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center text-xs text-gray-400 py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {buildCalendar().map((cell, i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-xs font-medium",
                        cell.day ? dayColor(cell.status) : ""
                      )}
                    >
                      {cell.day}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-3 text-xs justify-center">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-500 inline-block" />
                    Present
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-500 inline-block" />
                    Absent
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                    Leave
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
                    No Record
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === "fees" && (
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : (
            <>
              {/* Fee Summary */}
              {feeSummary && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      Rs. {feeSummary.totalPaid.toLocaleString("en-PK")}
                    </p>
                    <p className="text-xs text-green-500">Total Paid</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      Rs. {feeSummary.totalPending.toLocaleString("en-PK")}
                    </p>
                    <p className="text-xs text-amber-500">Pending</p>
                  </div>
                </div>
              )}

              {/* Fee Records */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {feeRecords.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                    Koi fee record nahi
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {feeRecords.map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {MONTHS[fee.month - 1]?.label} {fee.year}
                          </p>
                          <p className="text-xs text-gray-400">
                            Rs. {Number(fee.amount).toLocaleString("en-PK")}
                            {fee.paidAt && (
                              <> · Paid: {new Date(fee.paidAt).toLocaleDateString("en-PK")}</>
                            )}
                          </p>
                        </div>
                        {feeStatusBadge(fee.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-200 p-3">
                <p className="text-sm text-blue-700 text-center">
                  💡 Fees ke liye school se rabta karein. Online payment available nahi hai.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}