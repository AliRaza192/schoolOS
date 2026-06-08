"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import ReportCard from "@/components/dashboard/reports/report-card";
import PrintReport from "@/components/dashboard/reports/print-report";
import type { Class } from "@/db/schema";

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

interface ReportData {
  studentId: string;
  studentName: string;
  fatherName: string | null;
  rollNo: string | null;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalDays: number;
  feeStatus: string;
  paidFees: boolean;
  aiComment: string;
  month: number;
  year: number;
}

export default function ReportsPage() {
  const currentMonth = String(new Date().getMonth() + 1);
  const currentYear = String(new Date().getFullYear());

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [teacherNote, setTeacherNote] = useState("");
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [schoolName, setSchoolName] = useState("School");
  const [className, setClassName] = useState("");

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

  async function handleGenerate() {
    if (!selectedClassId) {
      toast.error("Class select karo");
      return;
    }

    setIsGenerating(true);
    setReports([]);
    setProgress(10);
    setProgressText("Students fetch ho rahe hain...");

    try {
      setProgress(30);
      setProgressText("Attendance aur fee data load ho raha hai...");

      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear),
          teacherNote: teacherNote || undefined,
        }),
      });

      setProgress(70);
      setProgressText("AI comments generate ho rahe hain...");

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation fail ho gayi");

      setProgress(100);
      setProgressText("Complete!");
      setReports(data.reports);
      setSchoolName(data.schoolName);
      setClassName(data.className);

      toast.success(`${data.totalProcessed} report cards generate ho gaye!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCommentEdit(studentId: string, newComment: string) {
    setReports((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, aiComment: newComment } : r
      )
    );
  }

  const avgAttendance =
    reports.length > 0
      ? Math.round(
          reports.reduce((sum, r) => sum + r.attendancePercentage, 0) /
            reports.length
        )
      : 0;

  const paidCount = reports.filter((r) => r.paidFees).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Print Component — hidden on screen */}
      <PrintReport
        reports={reports}
        schoolName={schoolName}
        className={className}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Report Cards</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gemini AI se auto-generate karo professional comments
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={selectedClassId} onValueChange={(v) => setSelectedClassId(v ?? "")}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Class select karo*" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.section ? `(${cls.section})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? "")}>
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

          <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v ?? "")}>
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

        {/* Teacher Note */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Teacher Note (Optional)
          </label>
          <textarea
            value={teacherNote}
            onChange={(e) => setTeacherNote(e.target.value.slice(0, 200))}
            placeholder="Koi khas baat jo sab students ke liye mention karni ho... (optional)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <p className="text-xs text-gray-400 text-right">
            {teacherNote.length}/200
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedClassId}
          className="w-full sm:w-auto"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? "Generate ho raha hai..." : "Generate Reports"}
        </Button>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{progressText}</p>
            <span className="text-sm text-gray-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-400 animate-pulse">
            Yeh kuch seconds lagenge...
          </p>
        </div>
      )}

      {/* Reports */}
      {reports.length > 0 && (
        <div className="space-y-4">
          {/* Summary Bar */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-6 text-sm">
              <span className="text-gray-600">
                Total: <strong>{reports.length}</strong>
              </span>
              <span className="text-gray-600">
                Avg Attendance: <strong className="text-blue-600">{avgAttendance}%</strong>
              </span>
              <span className="text-gray-600">
                Fees Paid: <strong className="text-green-600">{paidCount}/{reports.length}</strong>
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReports([])}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Generation
              </Button>
            </div>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.studentId}
                report={report}
                schoolName={schoolName}
                className={className}
                onCommentEdit={handleCommentEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
}