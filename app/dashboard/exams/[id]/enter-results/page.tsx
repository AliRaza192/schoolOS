"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { calculateGrade, getGradeColor } from "@/lib/exam-utils";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  rollNo: string | null;
}

interface ExamData {
  id: string;
  name: string;
  examDate: string;
  subjects: string[];
  totalMarks: string;
  class: { name: string; section: string | null } | null;
}

interface StudentMarks {
  [studentId: string]: {
    [subject: string]: number | "";
  };
}

export default function EnterResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<ExamData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<StudentMarks>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [examRes] = await Promise.all([
          fetch(`/api/exams/${examId}`),
        ]);
        const examData = await examRes.json();
        const examInfo = examData.exam;
        setExam(examInfo);

        // Fetch students for this class
        const studentsRes = await fetch(
          `/api/students?classId=${examInfo.classId}`
        );
        const studentsData = await studentsRes.json();
        const studentList = studentsData.students ?? [];
        setStudents(studentList);

        // Initialize marks from existing results
        const initialMarks: StudentMarks = {};
        studentList.forEach((s: Student) => {
          initialMarks[s.id] = {};
          examInfo.subjects.forEach((subject: string) => {
            const existingResult = examInfo.results?.find(
              (r: { studentId: string; subjectResults: { subject: string; marks: number }[] }) =>
                r.studentId === s.id
            );
            if (existingResult) {
              const subjectResult = existingResult.subjectResults.find(
                (sr: { subject: string }) => sr.subject === subject
              );
              initialMarks[s.id][subject] = subjectResult?.marks ?? "";
            } else {
              initialMarks[s.id][subject] = "";
            }
          });
        });
        setMarks(initialMarks);
      } catch {
        toast.error("Data load nahi ho saka");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [examId]);

  function handleMarkChange(studentId: string, subject: string, value: string) {
    const numValue = value === "" ? "" : parseFloat(value);
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue,
      },
    }));
  }

  function getStudentTotal(studentId: string): number {
    if (!marks[studentId]) return 0;
    return Object.values(marks[studentId]).reduce<number>((sum, m) => {
      return sum + (typeof m === "number" ? m : 0);
    }, 0);
  }

  function getStudentPercentage(studentId: string): number {
    if (!exam) return 0;
    const total = getStudentTotal(studentId);
    const possible = Number(exam.totalMarks);
    return possible > 0 ? Math.round((total / possible) * 100) : 0;
  }

  function markAllAbsent() {
    const newMarks: StudentMarks = {};
    students.forEach((s) => {
      newMarks[s.id] = {};
      exam?.subjects.forEach((subject) => {
        newMarks[s.id][subject] = 0;
      });
    });
    setMarks(newMarks);
  }

  async function handleSave() {
    if (!exam) return;
    setIsSaving(true);

    try {
      const results = students
        .filter((s) => {
          const studentMarks = marks[s.id];
          return (
            studentMarks &&
            Object.values(studentMarks).some((m) => m !== "")
          );
        })
        .map((s) => ({
          studentId: s.id,
          subjectResults: exam.subjects.map((subject) => ({
            subject,
            marks: Number(marks[s.id]?.[subject] ?? 0),
            totalMarks: Number(exam.totalMarks) / exam.subjects.length,
          })),
        }));

      if (results.length === 0) {
        toast.error("Koi marks enter nahi kiye");
        return;
      }

      const res = await fetch(`/api/exams/${examId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success("Results save ho gayi ✓");
      router.push(`/dashboard/exams/${examId}/results`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsSaving(false);
    }
  }

  const enteredCount = students.filter((s) => {
    const studentMarks = marks[s.id];
    return studentMarks && Object.values(studentMarks).some((m) => m !== "");
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
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
            {exam?.examDate} · Total: {exam?.totalMarks} marks
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          {enteredCount}/{students.length} entered
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={markAllAbsent}>
          Sab 0 Marks
        </Button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-3 py-3 text-gray-500 font-medium w-12">
                Roll
              </th>
              <th className="text-left px-3 py-3 text-gray-500 font-medium min-w-32">
                Student
              </th>
              {exam?.subjects.map((subject) => (
                <th
                  key={subject}
                  className="text-center px-3 py-3 text-gray-500 font-medium min-w-24"
                >
                  {subject}
                </th>
              ))}
              <th className="text-center px-3 py-3 text-gray-500 font-medium w-20">
                Total
              </th>
              <th className="text-center px-3 py-3 text-gray-500 font-medium w-16">
                %
              </th>
              <th className="text-center px-3 py-3 text-gray-500 font-medium w-16">
                Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, sIndex) => {
              const total = getStudentTotal(student.id);
              const pct = getStudentPercentage(student.id);
              const grade = calculateGrade(pct);

              return (
                <tr
                  key={student.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 text-gray-400 text-xs">
                    {student.rollNo ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {student.name}
                  </td>
                  {exam?.subjects.map((subject, subIndex) => {
                    const tabIndex = sIndex * (exam.subjects.length) + subIndex + 1;
                    return (
                      <td key={subject} className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          max={Number(exam.totalMarks) / exam.subjects.length}
                          tabIndex={tabIndex}
                          value={marks[student.id]?.[subject] ?? ""}
                          onChange={(e) =>
                            handleMarkChange(student.id, subject, e.target.value)
                          }
                          className={cn(
                            "w-full text-center border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                            marks[student.id]?.[subject] !== "" &&
                              Number(marks[student.id]?.[subject]) >
                                Number(exam.totalMarks) / exam.subjects.length
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          )}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-semibold text-gray-900">
                    {total}/{exam?.totalMarks}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    {pct}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        getGradeColor(grade)
                      )}
                    >
                      {grade}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 z-50">
        <Button variant="outline" onClick={() => router.push("/dashboard/exams")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Save ho raha hai...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Results
            </>
          )}
        </Button>
      </div>
    </div>
  );
}