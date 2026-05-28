"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
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
import { toast } from "sonner";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

type TabType = "attendance" | "fees" | "homework" | "timetable";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "leave";
}

interface FeeRecord {
  id: string;
  month: number;
  year: number;
  amount: string;
  paidAmount: string | null;
  status: string;
  paidAt: string | null;
}

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  dueDate: string;
  isCompleted: boolean;
}

interface TimetableSlot {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  periodNumber: number;
  room: string | null;
  teacher?: { name: string } | null;
}

export default function ParentStudentDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const currentMonth = String(new Date().getMonth() + 1);
  const currentYear = String(new Date().getFullYear());
  const todayIndex = new Date().getDay() - 1; // 0=Mon

  const [activeTab, setActiveTab] = useState<TabType>("attendance");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<{
    present: number; absent: number; leave: number; total: number; percentage: number;
  } | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeSummary, setFeeSummary] = useState<{ totalPaid: number; totalPending: number } | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [timetableSchedule, setTimetableSchedule] = useState<Record<string, TimetableSlot[]> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "attendance") fetchAttendance();
    else if (activeTab === "fees") fetchFees();
    else if (activeTab === "homework") fetchHomework();
    else if (activeTab === "timetable") fetchTimetable();
  }, [activeTab, selectedMonth, selectedYear]);

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

  async function fetchHomework() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/parent/${studentId}/homework`);
      const data = await res.json();
      setHomework(data.homework ?? []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTimetable() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/parent/${studentId}/timetable`);
      const data = await res.json();
      setTimetableSchedule(data.schedule ?? {});
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkHomeworkDone(id: string) {
    try {
      await fetch(`/api/homework/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      toast.success("Homework complete mark ho gaya!");
      fetchHomework();
    } catch {
      toast.error("Error aa gaya");
    }
  }

  function buildCalendar() {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: null, status: null });
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
      default: return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
    }
  }

  function getDueUrgency(dueDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <Badge className="bg-red-100 text-red-700">Overdue!</Badge>;
    if (diff === 0) return <Badge className="bg-orange-100 text-orange-700">Due Today</Badge>;
    if (diff === 1) return <Badge className="bg-amber-100 text-amber-700">Tomorrow</Badge>;
    return <Badge className="bg-green-100 text-green-700">In {diff} days</Badge>;
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "attendance", label: "Attendance" },
    { key: "fees", label: "Fees" },
    { key: "homework", label: "Homework" },
    { key: "timetable", label: "Timetable" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/parent">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Student Details</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2023", "2024", "2025", "2026"].map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <>
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

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
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
                          </p>
                        </div>
                        {feeStatusBadge(fee.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-blue-600 text-center bg-blue-50 rounded-lg p-3">
                💡 Fees ke liye school se rabta karein.
              </p>
            </>
          )}
        </div>
      )}

      {/* Homework Tab */}
      {activeTab === "homework" && (
        <div className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : homework.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              Koi pending homework nahi 🎉
            </div>
          ) : (
            homework.map((hw) => (
              <div key={hw.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      📚 {hw.subject}
                    </span>
                    <h3 className="font-semibold text-gray-900 mt-1">{hw.title}</h3>
                    {hw.description && (
                      <p className="text-sm text-gray-500">{hw.description}</p>
                    )}
                  </div>
                  {getDueUrgency(hw.dueDate)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Due: {hw.dueDate}</p>
                  {!hw.isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 h-7 text-xs"
                      onClick={() => handleMarkHomeworkDone(hw.id)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Mark Done
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Timetable Tab */}
      {activeTab === "timetable" && (
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : !timetableSchedule ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              Timetable available nahi
            </div>
          ) : (
            <>
              {/* Today's schedule highlighted */}
              {todayIndex >= 0 && todayIndex <= 5 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    📅 Aaj ka Schedule ({DAYS[todayIndex]})
                  </h3>
                  <div className="space-y-1">
                    {(timetableSchedule[DAY_KEYS[todayIndex]] ?? []).length === 0 ? (
                      <p className="text-sm text-blue-600">Koi class nahi</p>
                    ) : (
                      (timetableSchedule[DAY_KEYS[todayIndex]] ?? [])
                        .sort((a, b) => a.periodNumber - b.periodNumber)
                        .map((slot) => (
                          <div key={slot.id} className="flex gap-3 text-sm">
                            <span className="text-blue-400 w-24 flex-shrink-0">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="font-medium text-blue-800">{slot.subject}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Full week */}
              <div className="space-y-3">
                {DAY_KEYS.map((dayKey, index) => {
                  const slots = timetableSchedule[dayKey] ?? [];
                  const isToday = index === todayIndex;
                  return (
                    <div
                      key={dayKey}
                      className={cn(
                        "bg-white rounded-xl border p-4",
                        isToday ? "border-blue-300" : "border-gray-200"
                      )}
                    >
                      <h4 className={cn(
                        "font-semibold mb-2 text-sm",
                        isToday ? "text-blue-700" : "text-gray-700"
                      )}>
                        {DAYS[index]} {isToday && "← Aaj"}
                      </h4>
                      {slots.length === 0 ? (
                        <p className="text-xs text-gray-400">Koi class nahi</p>
                      ) : (
                        <div className="space-y-1">
                          {slots
                            .sort((a, b) => a.periodNumber - b.periodNumber)
                            .map((slot) => (
                              <div key={slot.id} className="flex gap-3 text-xs">
                                <span className="text-gray-400 w-24 flex-shrink-0">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <span className="font-medium text-gray-800">{slot.subject}</span>
                                {slot.room && (
                                  <span className="text-gray-400">Room {slot.room}</span>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}