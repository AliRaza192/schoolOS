"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, FileCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import CreateExamDialog from "@/components/dashboard/exams/create-exam-dialog";
import Link from "next/link";
import type { Class } from "@/db/schema";

interface ExamWithDetails {
  id: string;
  name: string;
  examDate: string;
  totalMarks: string;
  subjects: string[];
  resultsCount: number;
  class: { id: string; name: string; section: string | null } | null;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamWithDetails[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchExams() {
    try {
      const params = new URLSearchParams();
      if (classFilter && classFilter !== "all") params.set("classId", classFilter);
      const res = await fetch(`/api/exams?${params.toString()}`);
      const data = await res.json();
      setExams(data.exams ?? []);
    } catch {
      toast.error("Exams load nahi ho sake");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data.classes ?? []);
      } catch {
        // ignore
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [classFilter]);

  function getResultStatus(exam: ExamWithDetails) {
    if (exam.resultsCount === 0) {
      return <Badge className="bg-gray-100 text-gray-500">Results Pending</Badge>;
    }
    return (
      <Badge className="bg-green-100 text-green-700">
        Results: {exam.resultsCount} entered
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Exams & Results</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Exam
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={classFilter}
          onValueChange={(v) => setClassFilter(v ?? "")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} {cls.section ? `(${cls.section})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
            <FileCheck className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-gray-500">Koi exam nahi bana</p>
          <Button onClick={() => setDialogOpen(true)}>
            Pehla Exam Banao
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-gray-200 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{exam.name}</h3>
                  <p className="text-sm text-gray-400">
                    {exam.class?.name}
                    {exam.class?.section ? ` (${exam.class.section})` : ""}
                  </p>
                </div>
                {getResultStatus(exam)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                <span>📅 {exam.examDate}</span>
                <span>📊 Total: {exam.totalMarks} marks</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {exam.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <Link href={`/dashboard/exams/${exam.id}/enter-results`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Enter Results
                  </Button>
                </Link>
                <Link href={`/dashboard/exams/${exam.id}/results`} className="flex-1">
                  <Button size="sm" className="w-full">
                    View Results
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateExamDialog
        classes={classes}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchExams}
      />
    </div>
  );
}