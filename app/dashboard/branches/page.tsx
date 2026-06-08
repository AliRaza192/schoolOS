"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Plus,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import CreateBranchDialog from "@/components/dashboard/branches/create-branch-dialog";

interface BranchData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  branchCode: string;
  isMainBranch: boolean;
  studentCount: number;
  classCount: number;
  managerName: string | null;
}

interface ConsolidatedData {
  totalStudents: number;
  totalClasses: number;
  totalPendingFees: number;
  averageAttendance: number;
}

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [consolidated, setConsolidated] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [planAccess, setPlanAccess] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [branchesRes, consolidatedRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/branches/consolidated"),
      ]);

      if (branchesRes.status === 403) {
        setPlanAccess(false);
        return;
      }

      if (branchesRes.ok) {
        const data = await branchesRes.json();
        setBranches(data.branches ?? []);
      }

      if (consolidatedRes.ok) {
        const data = await consolidatedRes.json();
        setConsolidated(data);
      }
    } catch {
      toast.error("Branches load nahi ho sake");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!planAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Multi-Branch Academy Plan Mein Hai
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Multiple branches manage karne ke liye Academy plan chahiye.
          Upgrade karo aur apni school ki sab branches ek jagah manage karo.
        </p>
        <Button onClick={() => router.push("/dashboard/settings/billing")}>
          Academy Plan Dekhein
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branches / Campuses</h1>
          <p className="text-gray-500">Apni school ki sab branches manage karo</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Branch Add Karo
        </Button>
      </div>

      {/* Consolidated Stats */}
      {consolidated && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold">{consolidated.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Classes</p>
                  <p className="text-2xl font-bold">{consolidated.totalClasses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Avg Attendance</p>
                  <p className="text-2xl font-bold">{consolidated.averageAttendance}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Pending Fees</p>
                  <p className="text-2xl font-bold">
                    Rs. {consolidated.totalPendingFees.toLocaleString("en-PK")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Sirf Main Campus hai abhi</p>
            <p className="text-gray-400 mb-4">New branch add karo!</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Branch Add Karo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/branches/${branch.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      {branch.name}
                    </CardTitle>
                    {branch.city && (
                      <p className="text-sm text-gray-500">{branch.city}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {branch.isMainBranch && (
                      <Badge className="bg-blue-100 text-blue-700">Main Branch</Badge>
                    )}
                    <Badge variant="outline">{branch.branchCode}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="text-xl font-semibold">{branch.studentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Classes</p>
                    <p className="text-xl font-semibold">{branch.classCount}</p>
                  </div>
                </div>
                {branch.managerName && (
                  <p className="text-sm text-gray-500">
                    Manager: <span className="font-medium">{branch.managerName}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateBranchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
