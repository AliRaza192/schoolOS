"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { GraduationCap, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChildData {
  studentId: string;
  name: string;
  fatherName: string | null;
  rollNo: string | null;
  class: string;
  todayAttendance: "present" | "absent" | "leave" | null;
  feeStatus: "pending" | "paid" | "partial" | "overdue" | null;
  last7Days: { date: string; status: string | null }[];
}

export default function ParentHomePage() {
  const { user } = useUser();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch("/api/parent/students");
        const data = await res.json();
        setChildren(data.children ?? []);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    fetchChildren();
  }, []);

  function attendanceBadge(status: string | null) {
    if (!status) return <span className="text-gray-400 text-sm">Not marked</span>;
    if (status === "present")
      return <span className="text-green-600 text-sm font-medium">✓ Present</span>;
    if (status === "absent")
      return <span className="text-red-600 text-sm font-medium">✗ Absent</span>;
    return <span className="text-amber-600 text-sm font-medium">~ Leave</span>;
  }

  function feeBadge(status: string | null) {
    if (!status) return <Badge className="bg-gray-100 text-gray-500">No Record</Badge>;
    if (status === "paid") return <Badge className="bg-green-100 text-green-700">✓ Paid</Badge>;
    if (status === "pending") return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
    if (status === "partial") return <Badge className="bg-blue-100 text-blue-700">Partial</Badge>;
    return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Assalam o Alaikum! 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Apne bachon ki progress dekhein
        </p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            🎒 Koi student link nahi
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Apne bachay ke school admin se request karo ke woh aapka email{" "}
            <strong>
              ({user?.emailAddresses?.[0]?.emailAddress ?? "aapka email"})
            </strong>{" "}
            use kar ke aapke bachay ko link karein.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <div
              key={child.studentId}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">
                      {child.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-xs text-gray-400">
                      {child.class} · Roll No: {child.rollNo ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Aaj ki Hazri</p>
                  {attendanceBadge(child.todayAttendance)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Is Month ki Fee
                  </p>
                  {feeBadge(child.feeStatus)}
                </div>
              </div>

              {/* Last 7 Days */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Last 7 Days</p>
                <div className="flex gap-1.5">
                  {child.last7Days.map((day) => (
                    <div
                      key={day.date}
                      className={cn(
                        "flex-1 h-2 rounded-full",
                        day.status === "present"
                          ? "bg-green-500"
                          : day.status === "absent"
                          ? "bg-red-500"
                          : day.status === "leave"
                          ? "bg-amber-400"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              <Link href={`/student/${child.studentId}`}>
                <Button className="w-full" variant="outline">
                  Details Dekhein →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}