"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ResultSlip from "@/components/dashboard/exams/result-slip";
import {
  getGradeColor,
  getPositionLabel,
  generateResultRemarks,
} from "@/lib/exam-utils";
import { cn } from "@/lib/utils";

interface SubjectResult {
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
}

interface ResultData {
  id: string;
  studentId: string;
  totalObtained: string;
  totalPossible: string;
  percentage: string;
  grade: string | null;
  position: number | null;
  remarks: string | null;
  subjectResults: SubjectResult[];
  student: {
    name: string;
    fatherName: string | null;
    rollNo: string | null;
  };
}

interface ExamData {
  id: string;
  name: string;
  examDate: string;
  totalMarks: string;
  subjects: string[];
  class: { name: string; section: string | null } | null;
  results: ResultData[];
}

interface Stats {
  highest: number;
  lowest: number;
  average: number;
  passCount: number;
  failCount: number;
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolName] = useState("School");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/exams/${examId}`);
        const data = await res.json();
        setExam(data.exam);
        setStats(data.stats);
      } catch {
        toast.error("Results load nahi ho sake");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [examId]);

  const sortedResults = exam?.results
    ? [...exam.results].sort(
        (a, b) => (a.position ?? 999) - (b.position ?? 999)
      )
    : [];

  const printSlips = sortedResults.map((r) => ({
    studentName: r.student.name,
    fatherName: r.student.fatherName,
    rollNo: r.student.rollNo,
    className: exam?.class
      ? `${exam.class.name}${exam.class.section ? ` (${exam.class.section})` : ""}`
      : "—",
    examName: exam?.name ?? "",
    examDate: exam?.examDate ?? "",
    subjectResults: r.subjectResults,
    totalObtained: Number(r.totalObtained),
    totalPossible: Number(r.totalPossible),
    percentage: Number(r.percentage),
    grade: r.grade ?? "—",
    position: r.position,
    remarks:
      r.remarks ??
      generateResultRemarks(r.student.name, Number(r.percentage), r.grade ?? "F"),
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Print Slips — hidden on screen */}
      <ResultSlip results={printSlips} schoolName={schoolName} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/exams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{exam?.name}</h1>
          <p className="text-sm text-gray-400">
            {exam?.class?.name}
            {exam?.class?.section ? ` (${exam.class.section})` : ""} ·{" "}
            {exam?.examDate}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print All Slips
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Class Avg", value: `${stats.average}%`, color: "text-blue-600" },
            { label: "Highest", value: `${stats.highest}%`, color: "text-green-600" },
            { label: "Lowest", value: `${stats.lowest}%`, color: "text-red-600" },
            { label: "Pass", value: stats.passCount, color: "text-green-600" },
            { label: "Fail", value: stats.failCount, color: "text-red-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-200 p-3 text-center"
            >
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {sortedResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-gray-400">Koi result nahi</p>
            <Link href={`/dashboard/exams/${examId}/enter-results`}>
              <Button>Results Enter Karo</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-3 py-3 text-gray-500 font-medium">Position</th>
                <th className="text-left px-3 py-3 text-gray-500 font-medium">Roll</th>
                <th className="text-left px-3 py-3 text-gray-500 font-medium">Student</th>
                {exam?.subjects.map((s) => (
                  <th key={s} className="text-center px-3 py-3 text-gray-500 font-medium min-w-20">
                    {s}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium">%</th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-3 font-medium text-gray-700">
                    {getPositionLabel(result.position)}
                  </td>
                  <td className="px-3 py-3 text-gray-400 text-xs">
                    {result.student.rollNo ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    {result.student.name}
                  </td>
                  {exam?.subjects.map((subject) => {
                    const sr = result.subjectResults.find(
                      (s) => s.subject === subject
                    );
                    return (
                      <td key={subject} className="px-3 py-3 text-center">
                        {sr ? sr.marks : "—"}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center font-semibold">
                    {Number(result.totalObtained)}/{Number(result.totalPossible)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {Number(result.percentage)}%
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getGradeColor(result.grade ?? "F")
                      )}
                    >
                      {result.grade ?? "F"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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