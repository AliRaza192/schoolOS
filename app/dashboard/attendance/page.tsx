"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AttendanceCard from "@/components/dashboard/attendance/attendance-card";
import type { Class } from "@/db/schema";

interface AttendanceStudent {
  studentId: string;
  studentName: string;
  rollNo: string | null;
  attendanceId: string | null;
  status: "present" | "absent" | "leave" | null;
}

interface AttendanceData {
  date: string;
  classId: string;
  className: string;
  isMarked: boolean;
  students: AttendanceStudent[];
  summary: {
    total: number;
    present: number;
    absent: number;
    leave: number;
    unmarked: number;
  };
}

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, "present" | "absent" | "leave" | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const loadAttendance = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;
    setIsLoading(true);
    setAttendanceData(null);
    try {
      const res = await fetch(
        `/api/attendance?classId=${selectedClassId}&date=${selectedDate}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load nahi ho saka");
      setAttendanceData(data);
      const statuses: Record<string, "present" | "absent" | "leave" | null> = {};
      data.students.forEach((s: AttendanceStudent) => {
        statuses[s.studentId] = s.status;
      });
      setLocalStatuses(statuses);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedDate]);

  function handleStatusChange(studentId: string, status: string) {
    setLocalStatuses((prev) => ({
      ...prev,
      [studentId]: status as "present" | "absent" | "leave",
    }));
  }

  function markAllPresent() {
    if (!attendanceData) return;
    const statuses: Record<string, "present"> = {};
    attendanceData.students.forEach((s) => {
      statuses[s.studentId] = "present";
    });
    setLocalStatuses(statuses);
  }

  async function saveAttendance(force = false) {
    if (!attendanceData) return;

    if (attendanceData.isMarked && !force) {
      setConfirmOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const records = attendanceData.students
        .filter((s) => localStatuses[s.studentId] !== null)
        .map((s) => ({
          studentId: s.studentId,
          status: localStatuses[s.studentId]!,
        }));

      if (records.length === 0) {
        toast.error("Kam az kam ek student mark karo");
        return;
      }

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: attendanceData.classId,
          date: attendanceData.date,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save nahi ho saka");

      toast.success("Attendance save ho gayi ✓");
      loadAttendance();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsSaving(false);
    }
  }

  // Live summary from local statuses
  const liveSummary = attendanceData
    ? {
        present: Object.values(localStatuses).filter((s) => s === "present").length,
        absent: Object.values(localStatuses).filter((s) => s === "absent").length,
        leave: Object.values(localStatuses).filter((s) => s === "leave").length,
        unmarked: Object.values(localStatuses).filter((s) => s === null).length,
      }
    : null;

  return (
    <div className="space-y-6 pb-32">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            max={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <Button
            onClick={loadAttendance}
            disabled={!selectedClassId || !selectedDate || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Load ho raha hai...
              </>
            ) : (
              "Load Karo"
            )}
          </Button>
        </div>
      </div>

      {/* Empty — no class selected */}
      {!attendanceData && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-gray-500">Pehle class select karo aur "Load Karo" dabao</p>
        </div>
      )}

      {/* Attendance Sheet */}
      {attendanceData && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{attendanceData.className}</p>
                <p className="text-sm text-gray-400">{attendanceData.date}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {attendanceData.isMarked && (
                  <Badge className="bg-green-100 text-green-700">Marked ✓</Badge>
                )}
                <Badge className="bg-green-50 text-green-700">
                  Present: {liveSummary?.present ?? 0}
                </Badge>
                <Badge className="bg-red-50 text-red-700">
                  Absent: {liveSummary?.absent ?? 0}
                </Badge>
                <Badge className="bg-amber-50 text-amber-700">
                  Leave: {liveSummary?.leave ?? 0}
                </Badge>
                <Badge className="bg-gray-100 text-gray-600">
                  Unmarked: {liveSummary?.unmarked ?? 0}
                </Badge>
              </div>
            </div>
          </div>

          {/* Student List */}
          {attendanceData.students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200 gap-3">
              <p className="text-gray-500">Is class mein koi student nahi</p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard/students")}
              >
                Students Add Karo
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {attendanceData.students.map((student) => (
                <AttendanceCard
                  key={student.studentId}
                  student={{
                    ...student,
                    status: localStatuses[student.studentId] ?? null,
                  }}
                  onStatusChange={handleStatusChange}
                  disabled={isSaving}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Bar */}
      {attendanceData && attendanceData.students.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end z-50">
          <Button variant="outline" onClick={markAllPresent} disabled={isSaving}>
            Sab Present Mark Karo
          </Button>
          <Button onClick={() => saveAttendance(false)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Save ho raha hai...
              </>
            ) : (
              "Save Karo"
            )}
          </Button>
        </div>
      )}

      {/* Already Marked Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Attendance already marked hai</AlertDialogTitle>
            <AlertDialogDescription>
              Is date ki attendance pehle se mark hai. Update karna chahte ho?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                saveAttendance(true);
              }}
            >
              Update Karo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}