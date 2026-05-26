"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Class } from "@/db/schema";

interface HomeworkFormDialogProps {
  classes: Class[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function HomeworkFormDialog({
  classes,
  open,
  onOpenChange,
  onSuccess,
}: HomeworkFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      classId: "",
      subject: "",
      title: "",
      description: "",
      assignedDate: today,
      dueDate: "",
    },
  });

  const assignedDate = watch("assignedDate");

  function setQuickDueDate(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setValue("dueDate", date.toISOString().split("T")[0]);
  }

  async function onSubmit(values: {
    classId: string;
    subject: string;
    title: string;
    description: string;
    assignedDate: string;
    dueDate: string;
  }) {
    if (!values.classId) {
      toast.error("Class select karo");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success("Homework assign ho gaya!");
      onOpenChange(false);
      onSuccess();
      reset();
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
          <DialogTitle>Homework Assign Karo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Class */}
          <div className="space-y-1">
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

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Subject*</label>
            <Input
              placeholder="e.g. Mathematics"
              {...register("subject")}
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title*</label>
            <Input
              placeholder="Jaise: Chapter 3 - Practice Questions"
              {...register("title")}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Description (Optional)</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Details ya instructions..."
              {...register("description")}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Assigned Date*</label>
              <Input type="date" {...register("assignedDate")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Due Date*</label>
              <Input
                type="date"
                min={assignedDate}
                {...register("dueDate")}
              />
            </div>
          </div>

          {/* Quick Date Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuickDueDate(1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setQuickDueDate(3)}
              className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              In 3 days
            </button>
            <button
              type="button"
              onClick={() => setQuickDueDate(7)}
              className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Next Week
            </button>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assign ho raha hai...
                </>
              ) : (
                "Assign Karo"
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