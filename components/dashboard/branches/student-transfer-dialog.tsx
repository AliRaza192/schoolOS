"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search } from "lucide-react";

interface Student {
  id: string;
  name: string;
  fatherName: string | null;
  rollNo: string | null;
  classId: string | null;
}

interface Branch {
  id: string;
  name: string;
  branchCode: string;
}

interface ClassData {
  id: string;
  name: string;
  section: string | null;
}

interface StudentTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBranchId: string;
  branches: Branch[];
  onSuccess: () => void;
}

export default function StudentTransferDialog({
  open,
  onOpenChange,
  currentBranchId,
  branches,
  onSuccess,
}: StudentTransferDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [toBranchId, setToBranchId] = useState("");
  const [targetClasses, setTargetClasses] = useState<ClassData[]>([]);
  const [newClassId, setNewClassId] = useState("");
  const [transferDate, setTransferDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reason, setReason] = useState("");

  const otherBranches = branches.filter((b) => b.id !== currentBranchId);

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "50");

      const res = await fetch(`/api/students?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students ?? []);
      }
    } catch {
      // silent
    }
  }, [search]);

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open, fetchStudents]);

  useEffect(() => {
    if (toBranchId) {
      fetch(`/api/classes?branchId=${toBranchId}`)
        .then((r) => r.json())
        .then((data) => setTargetClasses(data.classes ?? []))
        .catch(() => {});
    }
  }, [toBranchId]);

  async function handleSubmit() {
    if (!selectedStudent || !toBranchId) {
      toast.error("Student aur destination branch select karo");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/branches/${currentBranchId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          fromBranchId: currentBranchId,
          toBranchId,
          transferDate,
          reason: reason || undefined,
          newClassId: newClassId || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Transfer nahi ho saka");

      toast.success("Student transfer complete!");
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose() {
    setStep(1);
    setSelectedStudent(null);
    setToBranchId("");
    setNewClassId("");
    setReason("");
    setSearch("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Student Transfer Karo</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Student Search Karo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Student name se search karo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedStudent?.id === student.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">
                    {student.fatherName && `Father: ${student.fatherName}`}
                    {student.rollNo && ` | Roll: ${student.rollNo}`}
                  </p>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-center text-gray-400 py-4">Koi student nahi mila</p>
              )}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedStudent}
              className="w-full"
            >
              Next: Transfer Details
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-medium">{selectedStudent?.name}</p>
            </div>

            <div>
              <Label>Destination Branch *</Label>
              <Select value={toBranchId} onValueChange={(v) => setToBranchId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch select karo" />
                </SelectTrigger>
                <SelectContent>
                  {otherBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.branchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {targetClasses.length > 0 && (
              <div>
                <Label>New Class (Optional)</Label>
                <Select value={newClassId} onValueChange={(v) => setNewClassId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Class select karo (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section ? `(${cls.section})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Transfer Date</Label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                placeholder="Transfer ki wajah..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Wapis Jao
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !toBranchId}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Transfer Karo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
