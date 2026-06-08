"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/stat-card";
import BulkFeeDialog from "@/components/dashboard/fees/bulk-fee-dialog";
import MarkPaidDialog from "@/components/dashboard/fees/mark-paid-dialog";
import FeeReceipt from "@/components/dashboard/fees/fee-receipt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, AlertCircle, TrendingUp, Users } from "lucide-react";
import type { Class } from "@/db/schema";
import Link from "next/link";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface FeeWithStudent {
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

interface Summary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
}

export default function FeesPage() {
  const currentMonth = String(new Date().getMonth() + 1);
  const currentYear = String(new Date().getFullYear());

  const [fees, setFees] = useState<FeeWithStudent[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("School");

  const [filters, setFilters] = useState({
    classId: "",
    month: currentMonth,
    year: currentYear,
    status: "",
    search: "",
  });

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [markPaidFee, setMarkPaidFee] = useState<FeeWithStudent | null>(null);
  const [receiptFee, setReceiptFee] = useState<FeeWithStudent | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data.classes ?? []);
      } catch {
        // ignore
      }
    }
    fetchClasses();
  }, []);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.classId && filters.classId !== "all") params.set("classId", filters.classId);
      if (filters.month && filters.month !== "all") params.set("month", filters.month);
      if (filters.year) params.set("year", filters.year);
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/fees?${params.toString()}`);
      const data = await res.json();
      setFees(data.fees ?? []);
      setSummary(data.summary ?? null);
    } catch {
      toast.error("Fees load nahi ho saki");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  async function handleOverdueUpdate() {
    try {
      const res = await fetch("/api/fees/overdue", { method: "POST" });
      const data = await res.json();
      toast.success(`${data.updated} fees overdue mark ho gayi`);
      fetchFees();
    } catch {
      toast.error("Overdue update nahi ho saka");
    }
  }

  function statusBadge(status: string) {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700">Paid ✓</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case "partial":
        return <Badge className="bg-blue-100 text-blue-700">Partial</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fees"
          value={`Rs. ${(summary?.totalAmount ?? 0).toLocaleString("en-PK")}`}
          label="Is month total"
          icon={DollarSign}
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Collected"
          value={`Rs. ${(summary?.collectedAmount ?? 0).toLocaleString("en-PK")}`}
          label="Jama hua"
          icon={TrendingUp}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending"
          value={`Rs. ${(summary?.pendingAmount ?? 0).toLocaleString("en-PK")}`}
          label="Baaki hai"
          icon={AlertCircle}
          color="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="Overdue"
          value={summary?.overdue ?? 0}
          label="Overdue fees"
          icon={Users}
          color="blue"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <Select
            value={filters.classId}
            onValueChange={(v) => setFilters((f) => ({ ...f, classId: v ?? "" }))}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sab Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sab Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} {cls.section ? `(${cls.section})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.month}
            onValueChange={(v) => setFilters((f) => ({ ...f, month: v ?? "" }))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sab Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.year}
            onValueChange={(v) => setFilters((f) => ({ ...f, year: v ?? "" }))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["2023", "2024", "2025", "2026"].map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, status: v ?? "" }))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sab Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sab Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Student naam..."
            className="w-44"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={() => setBulkDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Fees Generate Karo
          </Button>
          <Button variant="outline" onClick={handleOverdueUpdate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Overdue Update Karo
          </Button>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : fees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-gray-500">
              Is month ki fees generate nahi hui.
            </p>
            <Button onClick={() => setBulkDialogOpen(true)}>
              Fees Generate Karo
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Month/Year</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/fees/student/${fee.student.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {fee.student.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {fee.student.class
                      ? `${fee.student.class.name}${fee.student.class.section ? ` (${fee.student.class.section})` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {MONTHS[fee.month - 1]?.label?.slice(0, 3)} {fee.year}
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {["pending", "partial", "overdue"].includes(fee.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => setMarkPaidFee(fee)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {["paid", "partial"].includes(fee.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setReceiptFee(fee)}
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Bulk Fee Dialog */}
      <BulkFeeDialog
        classes={classes}
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={fetchFees}
      />

      {/* Mark Paid Dialog */}
      <MarkPaidDialog
        fee={markPaidFee}
        open={!!markPaidFee}
        onOpenChange={(open) => !open && setMarkPaidFee(null)}
        onSuccess={fetchFees}
      />

      {/* Receipt Dialog */}
      <Dialog open={!!receiptFee} onOpenChange={(open) => !open && setReceiptFee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fee Receipt</DialogTitle>
          </DialogHeader>
          {receiptFee && (
            <FeeReceipt fee={receiptFee} schoolName={schoolName} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}