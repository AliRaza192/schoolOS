"use client";

import { useState } from "react";
import { Pencil, Check, X, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportData {
  studentId: string;
  studentName: string;
  fatherName: string | null;
  rollNo: string | null;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  totalDays: number;
  feeStatus: string;
  paidFees: boolean;
  aiComment: string;
  month: number;
  year: number;
}

interface ReportCardProps {
  report: ReportData;
  schoolName: string;
  className: string;
  onCommentEdit: (studentId: string, newComment: string) => void;
}

function attendanceColor(pct: number) {
  if (pct >= 90) return { bar: "bg-green-500", text: "text-green-600", badge: "bg-green-100 text-green-700" };
  if (pct >= 75) return { bar: "bg-blue-500", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" };
  if (pct >= 50) return { bar: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" };
  return { bar: "bg-red-500", text: "text-red-600", badge: "bg-red-100 text-red-700" };
}

export default function ReportCard({
  report,
  schoolName,
  className,
  onCommentEdit,
}: ReportCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(report.aiComment);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const colors = attendanceColor(report.attendancePercentage);

  function handleSave() {
    onCommentEdit(report.studentId, editedComment);
    setIsEditing(false);
    setIsSaved(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(editedComment);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">
              {report.rollNo ?? "—"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{report.studentName}</p>
            <p className="text-xs text-gray-400">
              Father: {report.fatherName ?? "—"} · {className}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Attendance</span>
          <span className={cn("text-sm font-bold", colors.text)}>
            {report.attendancePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div
            className={cn("h-2 rounded-full transition-all", colors.bar)}
            style={{ width: `${report.attendancePercentage}%` }}
          />
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span className="text-green-600">P: {report.presentDays}</span>
          <span className="text-red-600">A: {report.absentDays}</span>
          <span className="text-amber-600">L: {report.leaveDays}</span>
          <span>Total: {report.totalDays} days</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Fee:</span>
          {report.paidFees ? (
            <Badge className="bg-green-100 text-green-700 text-xs">✓ Paid</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 text-xs">✗ Pending</Badge>
          )}
        </div>
      </div>

      {/* AI Comment */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            💬 Teacher&apos;s Comment
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="w-full text-sm border border-blue-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="h-7 text-xs">
                <Check className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditedComment(report.aiComment);
                  setIsEditing(false);
                }}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p
            className={cn(
              "text-sm text-gray-700 leading-relaxed rounded-lg p-2",
              isSaved && "border border-blue-200 bg-blue-50"
            )}
          >
            {editedComment}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={handleCopy}
        >
          {isCopied ? (
            <>
              <CheckCheck className="w-3 h-3 mr-1 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy Comment
            </>
          )}
        </Button>
      </div>
    </div>
  );
}