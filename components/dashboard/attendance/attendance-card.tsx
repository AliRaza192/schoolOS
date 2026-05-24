"use client";

import { cn } from "@/lib/utils";

interface AttendanceStudent {
  studentId: string;
  studentName: string;
  rollNo: string | null;
  status: "present" | "absent" | "leave" | null;
  attendanceId: string | null;
}

interface AttendanceCardProps {
  student: AttendanceStudent;
  onStatusChange: (studentId: string, status: string) => void;
  disabled: boolean;
}

export default function AttendanceCard({
  student,
  onStatusChange,
  disabled,
}: AttendanceCardProps) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
      {/* Left — Student Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-gray-500">
            {student.rollNo ?? "—"}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{student.studentName}</p>
        </div>
      </div>

      {/* Right — P/A/L Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatusChange(student.studentId, "present")}
          className={cn(
            "w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border",
            student.status === "present"
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-gray-400 border-gray-200 hover:border-green-400 hover:text-green-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          P
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatusChange(student.studentId, "absent")}
          className={cn(
            "w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border",
            student.status === "absent"
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-gray-400 border-gray-200 hover:border-red-400 hover:text-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          A
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onStatusChange(student.studentId, "leave")}
          className={cn(
            "w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 border",
            student.status === "leave"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-gray-400 border-gray-200 hover:border-amber-400 hover:text-amber-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          L
        </button>
      </div>
    </div>
  );
}