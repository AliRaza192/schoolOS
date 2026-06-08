"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import { Users, Plus, Search, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";
import StaffFormDialog from "@/components/dashboard/hr/staff-form-dialog";
import { DESIGNATIONS } from "@/lib/payroll";

interface StaffData {
  id: string;
  employeeCode: string;
  name: string;
  fatherName: string | null;
  designation: string;
  department: string | null;
  joiningDate: string;
  basicSalary: string;
  isActive: boolean;
  branchId: string | null;
}

export default function StaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (designationFilter !== "all") params.set("designation", designationFilter);

      const res = await fetch(`/api/staff?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff ?? []);
        setTotalCount(data.total ?? 0);
      }
    } catch {
      toast.error("Staff load nahi ho saka");
    } finally {
      setLoading(false);
    }
  }, [search, designationFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Stats
  const teachers = staffList.filter((s) => s.designation === "Teacher").length;
  const adminStaff = staffList.filter((s) => s.department === "Administration").length;
  const monthlyPayroll = staffList.reduce((sum, s) => sum + Number(s.basicSalary), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff & HR</h1>
          <p className="text-gray-500">Apna staff manage karo</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Staff Add Karo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Teachers</p>
              <p className="text-2xl font-bold">{teachers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Admin Staff</p>
              <p className="text-2xl font-bold">{adminStaff}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm text-gray-500">Monthly Payroll</p>
              <p className="text-2xl font-bold">Rs. {monthlyPayroll.toLocaleString("en-PK")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Name ya code se search karo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={designationFilter} onValueChange={setDesignationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Designation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Designations</SelectItem>
            {DESIGNATIONS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Staff Table */}
      {staffList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Koi staff nahi hai</p>
            <p className="text-gray-400 mb-4">&apos;Staff Add Karo&apos; se shuru karein</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Staff Add Karo
            </Button>
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
                  <TableHead>Department</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-sm">{member.employeeCode}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.designation}</TableCell>
                    <TableCell>{member.department || "—"}</TableCell>
                    <TableCell>{new Date(member.joiningDate).toLocaleDateString("en-PK")}</TableCell>
                    <TableCell>Rs. {Number(member.basicSalary).toLocaleString("en-PK")}</TableCell>
                    <TableCell>
                      <Badge className={member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/hr/${member.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <StaffFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchStaff}
      />
    </div>
  );
}
