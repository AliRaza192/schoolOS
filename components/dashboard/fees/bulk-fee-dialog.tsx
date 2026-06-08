"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkCreateFeeSchema, type BulkCreateFeeValues } from "@/lib/validations/fee";
import type { Class } from "@/db/schema";
import { z } from "zod";

const formSchema = bulkCreateFeeSchema.extend({
  month: z.string().min(1),
  year: z.string().min(1),
  amount: z.string().min(1),
});

type FormValues = {
  classId: string;
  month: string;
  year: string;
  amount: string;
  dueDate?: string;
};

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

interface BulkFeeDialogProps {
  classes: Class[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BulkFeeDialog({
  classes,
  open,
  onOpenChange,
  onSuccess,
}: BulkFeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentCount, setStudentCount] = useState<number | null>(null);

  const currentMonth = String(new Date().getMonth() + 1);
  const currentYear = String(new Date().getFullYear());

  const form = useForm<FormValues>({
    defaultValues: {
      classId: "",
      month: currentMonth,
      year: currentYear,
      amount: "",
      dueDate: "",
    },
  });

  const selectedClassId = form.watch("classId");

  useEffect(() => {
    if (!selectedClassId) {
      setStudentCount(null);
      return;
    }
    async function fetchCount() {
      try {
        const res = await fetch(`/api/students?classId=${selectedClassId}`);
        const data = await res.json();
        setStudentCount(data.total ?? 0);
      } catch {
        setStudentCount(null);
      }
    }
    fetchCount();
  }, [selectedClassId]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/fees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: values.classId,
          month: parseInt(values.month),
          year: parseInt(values.year),
          amount: parseFloat(values.amount),
          dueDate: values.dueDate || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Error");

      toast.success(`${data.created} students ki fees generate ho gayi! (${data.skipped} skip)`);
      onOpenChange(false);
      onSuccess();
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fees Generate Karo</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Class */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Class*</label>
            <Select
              value={form.watch("classId")}
              onValueChange={(v) => form.setValue("classId", v ?? "")}
            >
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
            {studentCount !== null && (
              <p className="text-sm text-blue-600">
                Is class mein {studentCount} students hain. {studentCount} fees generate hongi.
              </p>
            )}
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month*</label>
              <Select
                value={form.watch("month")}
                onValueChange={(v) => form.setValue("month", v ?? "")}
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year*</label>
              <Select
                value={form.watch("year")}
                onValueChange={(v) => form.setValue("year", v ?? "")}
              >
                <SelectTrigger>
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
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Fee Amount (Rs.)*</label>
            <Input
              type="number"
              placeholder="Jaise: 1500"
              {...form.register("amount")}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date (Optional)</label>
            <Input type="date" {...form.register("dueDate")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading || !form.watch("classId")}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generate ho raha hai...
                </>
              ) : (
                "Fees Generate Karo"
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