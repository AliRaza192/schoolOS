"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  BookOpen,
  ArrowLeft,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import AssignManagerDialog from "@/components/dashboard/branches/assign-manager-dialog";

interface BranchDetail {
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
  managerId: string | null;
}

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<BranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);

  const fetchBranch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/branches/${branchId}`);
      if (!res.ok) {
        toast.error("Branch nahi mili");
        router.push("/dashboard/branches");
        return;
      }
      const data = await res.json();
      setBranch(data.branch);
    } catch {
      toast.error("Branch load nahi ho saki");
    } finally {
      setLoading(false);
    }
  }, [branchId, router]);

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!branch) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/branches")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{branch.name}</h1>
            {branch.isMainBranch && (
              <Badge className="bg-blue-100 text-blue-700">Main Branch</Badge>
            )}
            <Badge variant="outline">{branch.branchCode}</Badge>
          </div>
          {branch.city && <p className="text-gray-500">{branch.city}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold">{branch.studentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Classes</p>
              <p className="text-2xl font-bold">{branch.classCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Manager</p>
              <p className="text-lg font-semibold">
                {branch.managerName || "Not Assigned"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Details */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p>{branch.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{branch.phone || "N/A"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setManagerDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {branch.managerId ? "Manager Change Karo" : "Manager Assign Karo"}
            </Button>
            <Button variant="outline" onClick={fetchBranch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <AssignManagerDialog
        open={managerDialogOpen}
        onOpenChange={setManagerDialogOpen}
        branchId={branchId}
        branchName={branch.name}
        onSuccess={fetchBranch}
      />
    </div>
  );
}
