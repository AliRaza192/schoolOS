"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Class } from "@/db/schema";

interface StudentReport {
  studentId: string;
  studentName: string;
  rollNo: string | null;
  present: number;
  absent: number;
  leave: number;
  totalDays: number;
  percentage: number;
}

interface ReportData {
  students: StudentReport[];
  workingDays: number;
  month: number;
  year: number;
  className: string;
}

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

const YEARS = ["2023", "2024", "2025", "2026"];

export default function AttendanceReportPage() {
  const currentMonth = String(new Date().getMonth() + 1);
  const currentYear = String(new Date().getFullYear());

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data.classes ?? []);
      } catch {
        toast.error("Classes load nahi ho saki");
      }
    }
    fetchClasses();
  }, []);

  async function loadReport() {
    if (!selectedClassId) return;
    setIsLoading(true);
    setReportData(null);
    try {
      const res = await fetch(
        `/api/attendance/report?classId=${selectedClassId}&month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Report load nahi ho saki");
      setReportData(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  const avgPercentage =
    reportData && reportData.students.length > 0
      ? Math.round(
          reportData.students.reduce((sum, s) => sum + s.percentage, 0) /
            reportData.students.length
        )
      : 0;

  function percentageColor(p: number) {
    if (p >= 75) return "text-green-600 font-semibold";
    if (p >= 50) return "text-amber-600 font-semibold";
    return "text-red-600 font-semibold";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        {reportData && (
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Class select karo" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.section ? `(${cls.section})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
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
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={loadReport}
            disabled={!selectedClassId || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Load ho raha hai...
              </>
            ) : (
              "Report Dekhao"
            )}
          </Button>
        </div>
      </div>

      {/* Report Table */}
      {reportData && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print:border-0">
          {/* Print Header */}
          <div className="hidden print:block p-4 border-b">
            <h2 className="text-xl font-bold">Attendance Report</h2>
            <p className="text-gray-600">
              {reportData.className} —{" "}
              {MONTHS.find((m) => m.value === String(reportData.month))?.label}{" "}
              {reportData.year}
            </p>
            <p className="text-gray-600">
              Total Working Days: {reportData.workingDays}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-green-600">Present</TableHead>
                <TableHead className="text-red-600">Absent</TableHead>
                <TableHead className="text-amber-600">Leave</TableHead>
                <TableHead>Total Days</TableHead>
                <TableHead>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.students.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>{student.rollNo ?? "—"}</TableCell>
                  <TableCell className="font-medium">{student.studentName}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {student.present}
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {student.absent}
                  </TableCell>
                  <TableCell className="text-amber-600 font-medium">
                    {student.leave}
                  </TableCell>
                  <TableCell>{student.totalDays}</TableCell>
                  <TableCell className={cn(percentageColor(student.percentage))}>
                    {student.percentage}%
                  </TableCell>
                </TableRow>
              ))}

              {/* Summary Row */}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={2}>Class Average</TableCell>
                <TableCell colSpan={4} className="text-gray-500 text-sm">
                  Working Days: {reportData.workingDays}
                </TableCell>
                <TableCell className={cn(percentageColor(avgPercentage))}>
                  {avgPercentage}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="px-4 py-3 border-t border-gray-100 print:hidden">
            <p className="text-sm text-gray-400">
              Print ke liye <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Ctrl+P</kbd> dabao
            </p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!reportData && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-400">
            Class, month aur year select karo phir "Report Dekhao" dabao
          </p>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .fixed, nav, header, aside { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}