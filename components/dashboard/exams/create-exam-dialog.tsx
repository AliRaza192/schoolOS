"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Class } from "@/db/schema";

const EXAM_SUGGESTIONS = ["Mid Term", "Final Term", "Unit Test", "Monthly Test"];
const DEFAULT_SUBJECTS = ["Mathematics", "English", "Urdu", "Science", "Islamiat"];

interface CreateExamDialogProps {
  classes: Class[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateExamDialog({
  classes,
  open,
  onOpenChange,
  onSuccess,
}: CreateExamDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [newSubject, setNewSubject] = useState("");

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      classId: "",
      examDate: "",
      totalMarks: "",
    },
  });

  function addSubject() {
    if (!newSubject.trim() || subjects.length >= 10) return;
    setSubjects((prev) => [...prev, newSubject.trim()]);
    setNewSubject("");
  }

  function removeSubject(index: number) {
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSubject(index: number, value: string) {
    setSubjects((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  async function onSubmit(values: {
    name: string;
    classId: string;
    examDate: string;
    totalMarks: string;
  }) {
    if (!values.classId) {
      toast.error("Class select karo");
      return;
    }
    if (subjects.filter((s) => s.trim()).length === 0) {
      toast.error("Kam az kam 1 subject add karo");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          classId: values.classId,
          examDate: values.examDate,
          totalMarks: parseFloat(values.totalMarks),
          subjects: subjects.filter((s) => s.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success("Exam create ho gaya!");
      onOpenChange(false);
      onSuccess();
      reset();
      setSubjects(DEFAULT_SUBJECTS);
      router.push(`/dashboard/exams/${data.exam.id}/enter-results`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Exam Banao</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Exam Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Name*</label>
            <Input placeholder="e.g. Mid Term Exam" {...register("name")} />
            <div className="flex gap-2 flex-wrap">
              {EXAM_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue("name", s)}
                  className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Class*</label>
            <Select onValueChange={(v) => setValue("classId", v)}>
              <SelectTrigger>
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
          </div>

          {/* Date + Total Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Exam Date*</label>
              <Input type="date" {...register("examDate")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Marks*</label>
              <Input
                type="number"
                placeholder="e.g. 500"
                {...register("totalMarks")}
              />
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Subjects* ({subjects.length}/10)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={subject}
                    onChange={(e) => updateSubject(index, e.target.value)}
                    placeholder={`Subject ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubject(index)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {subjects.length < 10 && (
              <div className="flex gap-2">
                <Input
                  placeholder="New subject add karo..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSubject}
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Create ho raha hai...
                </>
              ) : (
                "Exam Banao"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}