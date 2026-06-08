"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  FileText,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import SalaryStructureDialog from "@/components/dashboard/hr/salary-structure-dialog";

interface StaffDetail {
  id: string;
  employeeCode: string;
  name: string;
  fatherName: string | null;
  cnic: string | null;
  phone: string | null;
  designation: string;
  department: string | null;
  joiningDate: string;
  basicSalary: string;
  isActive: boolean;
}

interface SalaryStructureData {
  id: string;
  basicSalary: string;
  houseRent: string;
  medicalAllowance: string;
  transportAllowance: string;
  otherAllowances: string;
  providentFund: string;
  incomeTax: string;
  otherDeductions: string;
  grossSalary: string | null;
  netSalary: string | null;
  effectiveFrom: string;
}

interface LeaveBalanceData {
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  casualLeaveTotal: number;
  casualLeaveUsed: number;
  annualLeaveTotal: number;
  annualLeaveUsed: number;
}

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [salaryStructure, setSalaryStructure] = useState<SalaryStructureData | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/staff/${staffId}`);
      if (!res.ok) {
        toast.error("Staff nahi mila");
        router.push("/dashboard/hr");
        return;
      }
      const data = await res.json();
      setStaff(data.staff);
      setSalaryStructure(data.salaryStructure);
      setLeaveBalance(data.leaveBalance);
    } catch {
      toast.error("Data load nahi ho saka");
    } finally {
      setLoading(false);
    }
  }, [staffId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!staff) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/hr")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <Badge variant="outline">{staff.employeeCode}</Badge>
            <Badge className={staff.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {staff.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-gray-500">{staff.designation} {staff.department ? `• ${staff.department}` : ""}</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Father Name</p>
              <p>{staff.fatherName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CNIC</p>
              <p>{staff.cnic || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{staff.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joining Date</p>
              <p>{new Date(staff.joiningDate).toLocaleDateString("en-PK")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Salary Breakdown
            </CardTitle>
            <Button variant="outline" onClick={() => setSalaryDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {salaryStructure ? "Update" : "Set"} Salary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {salaryStructure ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">EARNINGS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>Rs. {Number(salaryStructure.basicSalary).toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent</span>
                    <span>Rs. {Number(salaryStructure.houseRent).toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Allowance</span>
                    <span>Rs. {Number(salaryStructure.medicalAllowance).toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport</span>
                    <span>Rs. {Number(salaryStructure.transportAllowance).toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Gross Salary</span>
                    <span>Rs. {Number(salaryStructure.grossSalary).toLocaleString("en-PK")}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-3">DEDUCTIONS</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Provident Fund</span>
                    <span>Rs. {Number(salaryStructure.providentFund).toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax</span>
                    <span>Rs. {Number(salaryStructure.incomeTax).toLocaleString("en-PK")}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Deductions</span>
                    <span>Rs. {(Number(salaryStructure.providentFund) + Number(salaryStructure.incomeTax) + Number(salaryStructure.otherDeductions)).toLocaleString("en-PK")}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Salary</span>
                    <span className="text-blue-600">Rs. {Number(salaryStructure.netSalary).toLocaleString("en-PK")}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CreditCard className="h-12 w-12 mx-auto mb-3" />
              <p>Salary structure abhi set nahi hui</p>
              <Button variant="outline" className="mt-3" onClick={() => setSalaryDialogOpen(true)}>
                Salary Set Karo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balance ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaveBalance ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Sick Leave</p>
                <p className="text-2xl font-bold text-blue-600">
                  {leaveBalance.sickLeaveTotal - leaveBalance.sickLeaveUsed}
                </p>
                <p className="text-xs text-gray-400">
                  {leaveBalance.sickLeaveUsed}/{leaveBalance.sickLeaveTotal} used
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Casual Leave</p>
                <p className="text-2xl font-bold text-green-600">
                  {leaveBalance.casualLeaveTotal - leaveBalance.casualLeaveUsed}
                </p>
                <p className="text-xs text-gray-400">
                  {leaveBalance.casualLeaveUsed}/{leaveBalance.casualLeaveTotal} used
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-500">Annual Leave</p>
                <p className="text-2xl font-bold text-purple-600">
                  {leaveBalance.annualLeaveTotal - leaveBalance.annualLeaveUsed}
                </p>
                <p className="text-xs text-gray-400">
                  {leaveBalance.annualLeaveUsed}/{leaveBalance.annualLeaveTotal} used
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">Leave balance data nahi hai</p>
          )}
        </CardContent>
      </Card>

      <SalaryStructureDialog
        open={salaryDialogOpen}
        onOpenChange={setSalaryDialogOpen}
        staffId={staffId}
        staffName={staff.name}
        currentStructure={salaryStructure}
        onSuccess={fetchData}
      />
    </div>
  );
}
