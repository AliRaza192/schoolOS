"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, BookOpen, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import HomeworkFormDialog from "@/components/dashboard/timetable/homework-form-dialog";
import type { Class } from "@/db/schema";
import { cn } from "@/lib/utils";

interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  assignedDate: string;
  dueDate: string;
  isCompleted: boolean;
  class: { name: string; section: string | null } | null;
  teacher: { name: string } | null;
}

type TabType = "pending" | "completed" | "all";

function getDueUrgency(dueDate: string, isCompleted: boolean) {
  if (isCompleted) return { label: "Completed", class: "bg-green-100 text-green-700" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue!", class: "bg-red-100 text-red-700" };
  if (diffDays === 0) return { label: "Due Today", class: "bg-orange-100 text-orange-700" };
  if (diffDays === 1) return { label: "Due Tomorrow", class: "bg-amber-100 text-amber-700" };
  return { label: `Due in ${diffDays} days`, class: "bg-green-100 text-green-700" };
}

export default function HomeworkPage() {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const fetchHomework = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === "pending") params.set("isCompleted", "false");
      if (activeTab === "completed") params.set("isCompleted", "true");

      const res = await fetch(`/api/homework?${params.toString()}`);
      const data = await res.json();
      setHomework(data.homework ?? []);
    } catch {
      toast.error("Homework load nahi ho saka");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  async function handleMarkComplete(id: string) {
    try {
      const res = await fetch(`/api/homework/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      if (!res.ok) throw new Error("Update nahi ho saka");
      toast.success("Homework complete mark ho gaya!");
      fetchHomework();
    } catch {
      toast.error("Error aa gaya");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/homework/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete nahi ho saka");
      toast.success("Homework delete ho gaya!");
      fetchHomework();
    } catch {
      toast.error("Error aa gaya");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Homework
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        {(["pending", "completed", "all"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium capitalize transition-all",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Homework List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : homework.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <BookOpen className="w-10 h-10 text-gray-300" />
          <p className="text-gray-400">Koi homework nahi</p>
          {activeTab === "pending" && (
            <Button onClick={() => setDialogOpen(true)}>
              Homework Assign Karo
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {homework.map((hw) => {
            const urgency = getDueUrgency(hw.dueDate, hw.isCompleted);
            return (
              <div
                key={hw.id}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        📚 {hw.subject}
                      </span>
                      <Badge className={urgency.class}>{urgency.label}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                    {hw.description && (
                      <p className="text-sm text-gray-500 mt-1">{hw.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="space-y-0.5">
                    <p>
                      Class:{" "}
                      {hw.class?.name}
                      {hw.class?.section ? ` (${hw.class.section})` : ""}
                    </p>
                    <p>
                      Assigned: {hw.assignedDate} | Due: {hw.dueDate}
                    </p>
                    {hw.teacher && <p>Teacher: {hw.teacher.name}</p>}
                  </div>

                  <div className="flex gap-2">
                    {!hw.isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 h-8 text-xs"
                        onClick={() => handleMarkComplete(hw.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 h-8"
                      onClick={() => handleDelete(hw.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HomeworkFormDialog
        classes={classes}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchHomework}
      />
    </div>
  );
}