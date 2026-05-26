"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Student, Class } from "@/db/schema";

interface StudentWithClass extends Student {
  class: Class | null;
}

interface LinkParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function LinkParentDialog({
  open,
  onOpenChange,
  onSuccess,
}: LinkParentDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StudentWithClass[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithClass | null>(null);
  const [parentEmail, setParentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSearch() {
    if (!search.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/students?search=${search}`);
      const data = await res.json();
      setSearchResults(data.students ?? []);
    } catch {
      toast.error("Search nahi ho saka");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSubmit() {
    if (!selectedStudent || !parentEmail) return;
    setIsLoading(true);
    setNotFoundError(false);
    try {
      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentEmail,
          studentId: selectedStudent.id,
        }),
      });

      const data = await res.json();

      if (data.notFound) {
        setNotFoundError(true);
        return;
      }

      if (!res.ok) throw new Error(data?.error || "Error");

      toast.success(`${data.parentName} ko ${data.studentName} se link kar diya!`);
      onOpenChange(false);
      onSuccess();
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setStep(1);
    setSearch("");
    setSearchResults([]);
    setSelectedStudent(null);
    setParentEmail("");
    setNotFoundError(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/sign-up`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Student Select Karo" : "Parent Email Enter Karo"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Student ka naam likho..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-gray-400">
                      {student.class
                        ? `${student.class.name}${student.class.section ? ` (${student.class.section})` : ""}`
                        : "No class"}{" "}
                      · Father: {student.fatherName ?? "—"}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Preview */}
            {selectedStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-800">
                  ✓ {selectedStudent.name}
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  Is student ke parent ko link karoge?
                </p>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!selectedStudent}
              onClick={() => setStep(2)}
            >
              Next →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Student Info */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium">{selectedStudent?.name}</p>
              <p className="text-gray-400 text-xs">
                {selectedStudent?.class
                  ? `${(selectedStudent.class as Class).name}`
                  : "No class"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Parent ka Email*</label>
              <Input
                type="email"
                placeholder="parent@gmail.com"
                value={parentEmail}
                onChange={(e) => {
                  setParentEmail(e.target.value);
                  setNotFoundError(false);
                }}
              />
              <p className="text-xs text-gray-400">
                Parent ko pehle schoolos.pk par sign up karna hoga
              </p>
            </div>

            {/* Not Found Error */}
            {notFoundError && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <p className="text-sm text-amber-800 font-medium">
                  Yeh email registered nahi hai.
                </p>
                <p className="text-xs text-amber-700">
                  Parent ko yeh link bhejo sign up ke liye:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                    {window.location.origin}/sign-up
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs flex-shrink-0"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <CheckCheck className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!parentEmail || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Link ho raha hai...
                  </>
                ) : (
                  "Link Karo"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}