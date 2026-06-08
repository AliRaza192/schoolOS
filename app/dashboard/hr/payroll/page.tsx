"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Download, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentData {
  id: string;
  staffId: string;
  staff: { name: string; employeeCode: string; designation: string };
  basicSalary: string;
  totalAllowances: string;
  totalDeductions: string;
  netSalary: string;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  workingDays: number;
  deductionForAbsent: string;
  finalPayable: string;
  status: string;
  paidAt: string | null;
  payslipNo: string | null;
}

interface Summary {
  totalStaff: number;
  paidCount: number;
  pendingCount: number;
  totalPayable: number;
  paidAmount: number;
  pendingAmount: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayrollPage() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [processOpen, setProcessOpen] = useState(false);
  const [workingDays, setWorkingDays] = useState("26");
  const [processing, setProcessing] = useState(false);

  const fetchPayroll = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ month, year });
      const res = await fetch(`/api/payroll?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments ?? []);
        setSummary(data.summary ?? null);
      }
    } catch {
      toast.error("Payroll load nahi ho saka");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  async function handleProcessPayroll() {
    setProcessing(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
          workingDays: Number(workingDays),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Payroll process nahi ho saka");

      toast.success(`${data.processed} staff ki salary process ho gayi!`);
      setProcessOpen(false);
      fetchPayroll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    } finally {
      setProcessing(false);
    }
  }

  async function handleMarkPaid(paymentId: string) {
    try {
      const res = await fetch(`/api/payroll/${paymentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "cash" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Mark paid nahi ho saka");
      }

      toast.success("Salary mark as paid!");
      fetchPayroll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    }
  }

  function handleExportCSV() {
    const url = `/api/payroll/export?month=${month}&year=${year}`;
    window.open(url, "_blank");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Payroll</h1>
          <p className="text-gray-500">{MONTHS[Number(month) - 1]} {year}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
          <Button onClick={() => setProcessOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div>
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-2xl font-bold">{summary.totalStaff}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold text-green-600">{summary.paidCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{summary.pendingCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payable</p>
                <p className="text-2xl font-bold">Rs. {summary.totalPayable.toLocaleString("en-PK")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Is month ki payroll process nahi hui</p>
            <p className="text-gray-400 mb-4">&apos;Process Payroll&apos; button use karo</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Emp Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Working Days</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">Deduction</TableHead>
                  <TableHead className="text-right">Final Payable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.staff.employeeCode}</TableCell>
                    <TableCell className="font-medium">{p.staff.name}</TableCell>
                    <TableCell>{p.staff.designation}</TableCell>
                    <TableCell className="text-right">{p.workingDays}</TableCell>
                    <TableCell className="text-right text-green-600">{p.presentDays}</TableCell>
                    <TableCell className="text-right text-red-600">{p.absentDays}</TableCell>
                    <TableCell className="text-right">Rs. {Number(p.basicSalary).toLocaleString("en-PK")}</TableCell>
                    <TableCell className="text-right text-red-600">Rs. {Number(p.deductionForAbsent).toLocaleString("en-PK")}</TableCell>
                    <TableCell className="text-right font-bold">Rs. {Number(p.finalPayable).toLocaleString("en-PK")}</TableCell>
                    <TableCell>
                      <Badge className={p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {p.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkPaid(p.id)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {p.status === "paid" && p.payslipNo && (
                        <span className="text-xs text-gray-400">{p.payslipNo}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Process Dialog */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month</Label>
                <Input value={MONTHS[Number(month) - 1]} disabled />
              </div>
              <div>
                <Label>Year</Label>
                <Input value={year} disabled />
              </div>
            </div>
            <div>
              <Label>Working Days *</Label>
              <Input
                type="number"
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
                placeholder="Is month mein kitne school days thay?"
              />
              <p className="text-xs text-gray-400 mt-1">
                Is month mein kitne din school khuli thi?
              </p>
            </div>
            <Button onClick={handleProcessPayroll} disabled={processing} className="w-full">
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Process Karo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
