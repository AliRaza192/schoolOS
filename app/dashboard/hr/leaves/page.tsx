"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar, Plus, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LeaveData {
  id: string;
  staffId: string;
  staff: { name: string; employeeCode: string };
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string | null;
  status: string;
  remarks: string | null;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [applyOpen, setApplyOpen] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/leaves?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves ?? []);
      }
    } catch {
      toast.error("Leaves load nahi ho sake");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  async function handleApprove(id: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Action fail ho gaya");
      }

      toast.success(action === "approve" ? "Leave approved!" : "Leave rejected!");
      fetchLeaves();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!staffId || !fromDate || !toDate) {
      toast.error("Staff, from date aur to date required hain");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          leaveType,
          fromDate,
          toDate,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Leave submit nahi ho saka");

      toast.success("Leave request submit ho gayi!");
      setApplyOpen(false);
      setStaffId("");
      setReason("");
      fetchLeaves();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    } finally {
      setSubmitting(false);
    }
  }

  const pendingLeaves = leaves.filter((l) => l.status === "pending");

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-gray-500">Staff ki leaves manage karo</p>
        </div>
        <Button onClick={() => setApplyOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Pending Approvals */}
      {pendingLeaves.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-700">
              {pendingLeaves.length} Leave Requests Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{leave.staff.name}</p>
                    <p className="text-sm text-gray-500">
                      {leave.leaveType} • {leave.totalDays} days • {new Date(leave.fromDate).toLocaleDateString("en-PK")} to {new Date(leave.toDate).toLocaleDateString("en-PK")}
                    </p>
                    {leave.reason && <p className="text-xs text-gray-400">{leave.reason}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(leave.id, "approve")}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApprove(leave.id, "reject")}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Status filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {/* Leaves Table */}
      {leaves.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Koi leave request nahi</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.staff.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{leave.leaveType}</Badge>
                    </TableCell>
                    <TableCell>{new Date(leave.fromDate).toLocaleDateString("en-PK")}</TableCell>
                    <TableCell>{new Date(leave.toDate).toLocaleDateString("en-PK")}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell className="max-w-32 truncate">{leave.reason || "—"}</TableCell>
                    <TableCell>
                      <Badge className={
                        leave.status === "approved" ? "bg-green-100 text-green-700" :
                        leave.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }>
                        {leave.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Staff ID *</Label>
              <Input
                placeholder="Staff ID paste karo"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                Staff detail page se ID copy karo
              </p>
            </div>
            <div>
              <Label>Leave Type *</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Date *</Label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label>To Date *</Label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                placeholder="Leave ki wajah..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Karo
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
