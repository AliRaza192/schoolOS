"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface PendingSubscription {
  id: string;
  plan: string;
  amount: string;
  paymentMethod: string;
  paymentProof: string;
  createdAt: string;
  school: {
    id: string;
    name: string;
    city: string | null;
  };
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PendingSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function fetchSubscriptions() {
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setSubscriptions(data.subscriptions ?? []);
    } catch {
      toast.error("Data load nahi ho saka");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function handleConfirm() {
    if (!confirmId) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${confirmId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Confirm nahi ho saka");
      toast.success("Subscription activate ho gayi!");
      setConfirmId(null);
      fetchSubscriptions();
    } catch {
      toast.error("Error aa gaya");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectId) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${rejectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Reject nahi ho saka");
      toast.success("Subscription reject ho gayi");
      setRejectId(null);
      fetchSubscriptions();
    } catch {
      toast.error("Error aa gaya");
    } finally {
      setIsProcessing(false);
    }
  }

  const confirmSub = subscriptions.find((s) => s.id === confirmId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin — Pending Subscriptions
        </h1>
        <Badge className="bg-red-100 text-red-700">
          {subscriptions.length} Pending
        </Badge>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-400">Koi pending subscription nahi</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <p className="font-medium">{sub.school.name}</p>
                    <p className="text-xs text-gray-400">{sub.school.city}</p>
                  </TableCell>
                  <TableCell className="capitalize font-medium">
                    {sub.plan}
                  </TableCell>
                  <TableCell>
                    Rs. {Number(sub.amount).toLocaleString("en-PK")}
                  </TableCell>
                  <TableCell className="capitalize">
                    {sub.paymentMethod.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {sub.paymentProof}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {new Date(sub.createdAt).toLocaleDateString("en-PK")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setConfirmId(sub.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setRejectId(sub.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Confirm Karo?</AlertDialogTitle>
            <AlertDialogDescription>
              Rs. {Number(confirmSub?.amount ?? 0).toLocaleString("en-PK")}{" "}
              confirm karo for{" "}
              <strong>{confirmSub?.school?.name}</strong>? School ka plan{" "}
              <strong className="capitalize">{confirmSub?.plan}</strong> ho
              jayega.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Confirm Karo ✓"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog
        open={!!rejectId}
        onOpenChange={(open) => !open && setRejectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Reject Karo?</AlertDialogTitle>
            <AlertDialogDescription>
              Yeh subscription reject ho jayegi aur school ko notify kiya
              jayega.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Processing..." : "Reject Karo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}