"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Pencil, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TimetableCell from "@/components/dashboard/timetable/timetable-cell";
import BulkSetupDialog from "@/components/dashboard/timetable/bulk-setup-dialog";
import type { Class, TimetableSlot } from "@/db/schema";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

type SlotWithTeacher = TimetableSlot & {
  teacher?: { name: string } | null;
};

type Schedule = Record<string, SlotWithTeacher[]>;

export default function TimetablePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0); // for mobile tabs

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

  const fetchTimetable = useCallback(async () => {
    if (!selectedClassId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/timetable?classId=${selectedClassId}`);
      const data = await res.json();
      setSchedule(data.schedule ?? {});
    } catch {
      toast.error("Timetable load nahi ho saka");
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  function getSlotForCell(dayKey: string, period: number): SlotWithTeacher | null {
    if (!schedule) return null;
    return schedule[dayKey]?.find((s) => s.periodNumber === period) ?? null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
        <div className="flex items-center gap-3">
          <Select value={selectedClassId} onValueChange={(v) => setSelectedClassId(v ?? "")}>
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

          {selectedClassId && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDialogOpen(true)}
              >
                <Zap className="w-4 h-4 mr-1" />
                Quick Setup
              </Button>
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                {isEditMode ? "Done Editing" : "Edit Mode"}
              </Button>
            </>
          )}
        </div>
      </div>

      {!selectedClassId ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Class select karo timetable dekhne ke liye
        </div>
      ) : isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs text-gray-500 font-medium w-20">
                    Period
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-3 py-3 text-center text-xs text-gray-500 font-medium min-w-32"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-xs text-gray-400 font-medium">
                      P{period}
                    </td>
                    {DAY_KEYS.map((dayKey) => (
                      <td key={dayKey} className="px-2 py-2">
                        <TimetableCell
                          slot={getSlotForCell(dayKey, period)}
                          dayOfWeek={DAY_KEYS.indexOf(dayKey) + 1}
                          periodNumber={period}
                          isEditMode={isEditMode}
                          classId={selectedClassId}
                          onUpdate={fetchTimetable}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden space-y-4">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(index)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 transition-all",
                    activeDay === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {PERIODS.map((period) => (
                <div key={period} className="flex gap-3 items-start">
                  <div className="w-8 text-xs text-gray-400 pt-2 flex-shrink-0">
                    P{period}
                  </div>
                  <div className="flex-1">
                    <TimetableCell
                      slot={getSlotForCell(DAY_KEYS[activeDay], period)}
                      dayOfWeek={activeDay + 1}
                      periodNumber={period}
                      isEditMode={isEditMode}
                      classId={selectedClassId}
                      onUpdate={fetchTimetable}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <BulkSetupDialog
        classes={classes}
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={() => {
          fetchTimetable();
          setBulkDialogOpen(false);
        }}
      />
    </div>
  );
}