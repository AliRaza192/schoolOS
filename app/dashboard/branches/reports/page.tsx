"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Printer } from "lucide-react";
import { toast } from "sonner";

interface BranchReport {
  branchId: string;
  branchName: string;
  branchCode: string;
  students: number;
  classes: number;
  todayAttendance: number;
  pendingFees: number;
}

interface ConsolidatedData {
  totalStudents: number;
  totalClasses: number;
  totalPendingFees: number;
  averageAttendance: number;
  branches: BranchReport[];
}

export default function BranchReportsPage() {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/branches/consolidated");
      if (!res.ok) {
        toast.error("Report load nahi ho saki");
        return;
      }
      const result = await res.json();
      setData(result);
    } catch {
      toast.error("Report load nahi ho saki");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Consolidated Reports</h1>
          <p className="text-gray-500">Sab branches ka comparison</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-3xl font-bold text-blue-600">{data.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total Classes</p>
            <p className="text-3xl font-bold text-green-600">{data.totalClasses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Avg Attendance</p>
            <p className="text-3xl font-bold text-purple-600">{data.averageAttendance}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total Pending Fees</p>
            <p className="text-3xl font-bold text-amber-600">
              Rs. {data.totalPendingFees.toLocaleString("en-PK")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Branch-wise Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Classes</TableHead>
                <TableHead className="text-right">Attendance</TableHead>
                <TableHead className="text-right">Pending Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.branches.map((branch) => (
                <TableRow key={branch.branchId}>
                  <TableCell className="font-medium">
                    {branch.branchName}
                    <span className="text-xs text-gray-400 ml-2">
                      ({branch.branchCode})
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{branch.students}</TableCell>
                  <TableCell className="text-right">{branch.classes}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        branch.todayAttendance >= 80
                          ? "text-green-600"
                          : branch.todayAttendance >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                      }
                    >
                      {branch.todayAttendance}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    Rs. {branch.pendingFees.toLocaleString("en-PK")}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="font-bold bg-gray-50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{data.totalStudents}</TableCell>
                <TableCell className="text-right">{data.totalClasses}</TableCell>
                <TableCell className="text-right">{data.averageAttendance}%</TableCell>
                <TableCell className="text-right">
                  Rs. {data.totalPendingFees.toLocaleString("en-PK")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-400">
        Print ke liye Ctrl+P dabao
      </p>
    </div>
  );
}
