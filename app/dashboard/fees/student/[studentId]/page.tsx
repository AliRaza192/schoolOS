"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import MarkPaidDialog from "@/components/dashboard/fees/mark-paid-dialog";
import Link from "next/link";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface FeeRecord {
  id: string;
  month: number;
  year: number;
  amount: string;
  paidAmount: string | null;
  status: "pending" | "paid" | "partial" | "overdue";
  receiptNo: string | null;
  dueDate: string | null;
  paidAt: string | null;
  student: {
    id: string;
    name: string;
    fatherName: string | null;
    class: { name: string; section: string | null } | null;
  };
}

export default function StudentFeeHistoryPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markPaidFee, setMarkPaidFee] = useState<FeeRecord | null>(null);

  async function fetchFees() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/fees?search=&classId=`);
      const data = await res.json();
      const studentFees = (data.fees ?? []).filter(
        (f: FeeRecord) => f.student.id === studentId
      );
      setFees(studentFees);
    } catch {
      toast.error("Fees load nahi ho saki");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchFees();
  }, [studentId]);

  const student = fees[0]?.student;
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paidAmount ?? 0), 0);
  const totalPending = fees
    .filter((f) => f.status !== "paid")
    .reduce((sum, f) => sum + (Number(f.amount) - Number(f.paidAmount ?? 0)), 0);

  function statusBadge(status: string) {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-700">Paid ✓</Badge>;
      case "pending": return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "partial": return <Badge className="bg-blue-100 text-blue-700">Partial</Badge>;
      case "overdue": return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/fees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Student Fee History</h1>
      </div>

      {/* Student Info */}
      {student && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Student Name</p>
              <p className="font-semibold">{student.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Father Name</p>
              <p className="font-semibold">{student.fatherName ?? "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">Class</p>
              <p className="font-semibold">
                {student.class
                  ? `${student.class.name}${student.class.section ? ` (${student.class.section})` : ""}`
                  : "—"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400">Total Paid</p>
                <p className="font-semibold text-green-600">
                  Rs. {totalPaid.toLocaleString("en-PK")}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Pending</p>
                <p className="font-semibold text-amber-600">
                  Rs. {totalPending.toLocaleString("en-PK")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : fees.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <p className="text-gray-500">Koi fee record nahi mila</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month/Year</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">
                    {MONTHS[fee.month - 1]} {fee.year}
                  </TableCell>
                  <TableCell>
                    Rs. {Number(fee.amount).toLocaleString("en-PK")}
                  </TableCell>
                  <TableCell>
                    {fee.paidAmount
                      ? `Rs. ${Number(fee.paidAmount).toLocaleString("en-PK")}`
                      : "—"}
                  </TableCell>
                  <TableCell>{statusBadge(fee.status)}</TableCell>
                  <TableCell>{fee.dueDate ?? "—"}</TableCell>
                  <TableCell>{fee.receiptNo ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {["pending", "partial", "overdue"].includes(fee.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        onClick={() => setMarkPaidFee(fee)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Mark Paid Dialog */}
      <MarkPaidDialog
        fee={markPaidFee}
        open={!!markPaidFee}
        onOpenChange={(open) => !open && setMarkPaidFee(null)}
        onSuccess={fetchFees}
      />
    </div>
  );
}