"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Student, Class } from "@/db/schema";

interface StudentWithClass extends Student {
  class: Class | null;
}

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "leave";
}

interface FeeRecord {
  status: "pending" | "paid" | "partial" | "overdue";
  month: number;
  year: number;
}

interface StudentDetailSheetProps {
  studentId: string | null;
  onClose: () => void;
}

export default function StudentDetailSheet({
  studentId,
  onClose,
}: StudentDetailSheetProps) {
  const [student, setStudent] = useState<StudentWithClass | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feeStatus, setFeeStatus] = useState<FeeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    async function fetchStudent() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/students/${studentId}`);
        const data = await res.json();
        setStudent(data.student);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudent();
  }, [studentId]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  function getAttendanceDot(date: string) {
    const record = attendance.find((a) => a.date === date);
    if (!record) return "bg-gray-200";
    if (record.status === "present") return "bg-green-500";
    if (record.status === "absent") return "bg-red-500";
    return "bg-yellow-400";
  }

  return (
    <Sheet open={!!studentId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Student Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : student ? (
          <div className="space-y-6 mt-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-lg">{student.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Father Name</p>
                  <p className="font-medium">{student.fatherName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Class</p>
                  <p className="font-medium">
                    {student.class
                      ? `${student.class.name}${student.class.section ? ` (${student.class.section})` : ""}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="font-medium">{student.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Roll No</p>
                  <p className="font-medium">{student.rollNo ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date of Birth</p>
                  <p className="font-medium">{student.dob ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Admission Date</p>
                  <p className="font-medium">{student.admissionDate}</p>
                </div>
              </div>
              {student.address && (
                <div>
                  <p className="text-gray-400 text-sm">Address</p>
                  <p className="font-medium text-sm">{student.address}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Attendance Last 7 Days */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                Last 7 Days Attendance
              </h4>
              <div className="flex gap-2">
                {last7Days.map((date) => (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 h-6 rounded-full ${getAttendanceDot(date)}`}
                    />
                    <span className="text-xs text-gray-400">
                      {new Date(date).getDate()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Absent
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />
                  No Record
                </span>
              </div>
            </div>

            <Separator />

            {/* Fee Status */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                Current Month Fee
              </h4>
              {feeStatus ? (
                <Badge
                  className={
                    feeStatus.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : feeStatus.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {feeStatus.status.toUpperCase()}
                </Badge>
              ) : (
                <p className="text-sm text-gray-400">Koi fee record nahi</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mt-6">Student nahi mila</p>
        )}
      </SheetContent>
    </Sheet>
  );
}