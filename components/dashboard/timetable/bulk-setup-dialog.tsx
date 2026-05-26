"use client";

import { useState } from "react";
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

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface BulkSetupDialogProps {
  classes: Class[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BulkSetupDialog({
  classes,
  open,
  onOpenChange,
  onSuccess,
}: BulkSetupDialogProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [config, setConfig] = useState({
    startTime: "08:00",
    periodDuration: 45,
    breakAfterPeriod: 4,
    breakDuration: 20,
    numPeriods: 7,
    workingDays: [1, 2, 3, 4, 5],
  });
  const [subjects, setSubjects] = useState<string[]>([
    "Mathematics", "English", "Urdu", "Science", "Islamiat", "Social Studies", "Computer",
  ]);

  function calculateTimes() {
    const times: { start: string; end: string }[] = [];
    let [hours, minutes] = config.startTime.split(":").map(Number);

    for (let i = 0; i < config.numPeriods; i++) {
      const start = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      let endMinutes = minutes + config.periodDuration;
      let endHours = hours + Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
      const end = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
      times.push({ start, end });

      hours = endHours;
      minutes = endMinutes;

      // Break after specified period
      if (i + 1 === config.breakAfterPeriod) {
        minutes += config.breakDuration;
        if (minutes >= 60) {
          hours += Math.floor(minutes / 60);
          minutes = minutes % 60;
        }
      }
    }
    return times;
  }

  async function handleGenerate() {
    if (!selectedClassId) {
      toast.error("Class select karo");
      return;
    }

    setIsLoading(true);
    try {
      const times = calculateTimes();
      const slots = [];

      for (const day of config.workingDays) {
        for (let p = 0; p < config.numPeriods; p++) {
          const subject = subjects[p % subjects.length];
          if (!subject) continue;
          slots.push({
            classId: selectedClassId,
            dayOfWeek: day,
            periodNumber: p + 1,
            startTime: times[p].start,
            endTime: times[p].end,
            subject,
          });
        }
      }

      const res = await fetch("/api/timetable/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClassId, slots }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success(`${data.created} slots create ho gaye!`);
      onOpenChange(false);
      onSuccess();
      setStep(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  const previewTimes = calculateTimes();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Timetable Setup</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class Select Karo*</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={config.startTime}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Period Duration (min)</label>
                <Input
                  type="number"
                  value={config.periodDuration}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      periodDuration: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Break After Period</label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={config.breakAfterPeriod}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      breakAfterPeriod: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Break Duration (min)</label>
                <Input
                  type="number"
                  value={config.breakDuration}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      breakDuration: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Total Periods</label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={config.numPeriods}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      numPeriods: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {/* Working Days */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Working Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() =>
                      setConfig((c) => ({
                        ...c,
                        workingDays: c.workingDays.includes(day.value)
                          ? c.workingDays.filter((d) => d !== day.value)
                          : [...c.workingDays, day.value],
                      }))
                    }
                    className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                      config.workingDays.includes(day.value)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              <p className="font-medium text-gray-700">Time Preview:</p>
              {previewTimes.map((t, i) => (
                <p key={i} className="text-gray-500">
                  Period {i + 1}: {t.start} - {t.end}
                  {i + 1 === config.breakAfterPeriod && (
                    <span className="ml-2 text-amber-600">← Break after this</span>
                  )}
                </p>
              ))}
            </div>

            <Button className="w-full" onClick={() => setStep(2)}>
              Next: Add Subjects →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Subjects list karo (period order mein rotate honge)
            </p>
            <div className="space-y-2">
              {subjects.map((subject, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={subject}
                    onChange={(e) => {
                      const newSubjects = [...subjects];
                      newSubjects[i] = e.target.value;
                      setSubjects(newSubjects);
                    }}
                    placeholder={`Subject ${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400"
                    onClick={() =>
                      setSubjects((s) => s.filter((_, idx) => idx !== i))
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubjects((s) => [...s, ""])}
              >
                + Subject Add Karo
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generate ho raha hai...
                  </>
                ) : (
                  "Generate Timetable"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}