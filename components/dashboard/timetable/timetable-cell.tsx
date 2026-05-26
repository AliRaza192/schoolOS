"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TimetableSlot } from "@/db/schema";

// Subject color palette
const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-cyan-100 text-cyan-800 border-cyan-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
];

function getSubjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

interface TimetableCellProps {
  slot: (TimetableSlot & { teacher?: { name: string } | null }) | null;
  dayOfWeek: number;
  periodNumber: number;
  isEditMode: boolean;
  classId: string;
  onUpdate: () => void;
}

export default function TimetableCell({
  slot,
  dayOfWeek,
  periodNumber,
  isEditMode,
  classId,
  onUpdate,
}: TimetableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    subject: slot?.subject ?? "",
    startTime: slot?.startTime ?? "08:00",
    endTime: slot?.endTime ?? "08:45",
    room: slot?.room ?? "",
  });

  async function handleSave() {
    if (!form.subject.trim()) {
      toast.error("Subject required hai");
      return;
    }
    setIsSaving(true);
    try {
      if (slot) {
        // Update — delete and recreate (simplest approach)
        await fetch(`/api/timetable/${slot.id}`, { method: "DELETE" });
      }

      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          dayOfWeek,
          periodNumber,
          startTime: form.startTime,
          endTime: form.endTime,
          subject: form.subject,
          room: form.room || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success("Slot save ho gaya!");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!slot) return;
    try {
      await fetch(`/api/timetable/${slot.id}`, { method: "DELETE" });
      toast.success("Slot delete ho gaya!");
      setIsEditing(false);
      onUpdate();
    } catch {
      toast.error("Delete nahi ho saka");
    }
  }

  // Edit form
  if (isEditing) {
    return (
      <div className="p-2 space-y-1.5 min-h-24 border-2 border-blue-400 rounded-lg bg-blue-50">
        <Input
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="Subject"
          className="h-7 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-1">
          <Input
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            type="time"
            className="h-7 text-xs"
          />
          <Input
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            type="time"
            className="h-7 text-xs"
          />
        </div>
        <Input
          value={form.room}
          onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
          placeholder="Room (optional)"
          className="h-7 text-xs"
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs"
            onClick={() => setIsEditing(false)}
          >
            <X className="w-3 h-3" />
          </Button>
          {slot && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs text-red-500"
              onClick={handleDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Empty cell in edit mode
  if (!slot && isEditMode) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full min-h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all"
      >
        <Plus className="w-5 h-5 text-gray-300" />
      </button>
    );
  }

  // Empty cell not in edit mode
  if (!slot) {
    return (
      <div className="min-h-24 rounded-lg bg-gray-50 border border-gray-100" />
    );
  }

  // Slot view
  const colorClass = getSubjectColor(slot.subject);
  return (
    <div
      className={cn(
        "min-h-24 rounded-lg border p-2 space-y-1",
        colorClass,
        isEditMode && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
      onClick={() => isEditMode && setIsEditing(true)}
    >
      <p className="font-semibold text-xs leading-tight">{slot.subject}</p>
      {slot.teacher && (
        <p className="text-xs opacity-70">{slot.teacher.name}</p>
      )}
      <p className="text-xs opacity-60">
        {slot.startTime} - {slot.endTime}
      </p>
      {slot.room && (
        <p className="text-xs opacity-60">Room: {slot.room}</p>
      )}
    </div>
  );
}