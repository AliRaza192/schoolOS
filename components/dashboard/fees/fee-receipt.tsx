"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface FeeReceiptProps {
  fee: {
    id: string;
    month: number;
    year: number;
    amount: string;
    paidAmount: string | null;
    status: string;
    receiptNo: string | null;
    paidAt: string | null;
    student: {
      name: string;
      fatherName: string | null;
      class: { name: string; section: string | null } | null;
    };
  };
  schoolName: string;
}

export default function FeeReceipt({ fee, schoolName }: FeeReceiptProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div>
      {/* Print Button */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
      </div>

      {/* Receipt */}
      <div
        id="receipt"
        className="border border-gray-200 rounded-xl p-6 max-w-sm mx-auto bg-white"
      >
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">{schoolName}</h2>
          <p className="text-sm text-gray-500 mt-1">Fee Receipt</p>
        </div>

        {/* Receipt Info */}
        <div className="space-y-1 text-sm border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Receipt No</span>
            <span className="font-medium">{fee.receiptNo ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">{formatDate(fee.paidAt)}</span>
          </div>
        </div>

        {/* Student Info */}
        <div className="space-y-1 text-sm border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Student</span>
            <span className="font-medium">{fee.student.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Father</span>
            <span className="font-medium">{fee.student.fatherName ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Class</span>
            <span className="font-medium">
              {fee.student.class
                ? `${fee.student.class.name}${fee.student.class.section ? ` (${fee.student.class.section})` : ""}`
                : "—"}
            </span>
          </div>
        </div>

        {/* Fee Info */}
        <div className="space-y-1 text-sm border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Fee Month</span>
            <span className="font-medium">
              {MONTHS[fee.month - 1]} {fee.year}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-medium">
              Rs. {Number(fee.amount).toLocaleString("en-PK")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paid</span>
            <span className="font-medium text-green-600">
              Rs. {Number(fee.paidAmount ?? 0).toLocaleString("en-PK")}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Status</span>
            <span className="text-green-600 uppercase">
              {fee.status} {fee.status === "paid" ? "✓" : ""}
            </span>
          </div>
        </div>

        {/* Signature */}
        <div className="text-sm text-gray-500">
          <p>Authorized Signature: ____________________</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; border: none; }
        }
      `}</style>
    </div>
  );
}