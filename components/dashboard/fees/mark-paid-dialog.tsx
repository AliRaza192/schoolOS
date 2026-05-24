"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface FeeWithStudent {
  id: string;
  month: number;
  year: number;
  amount: string;
  paidAmount: string | null;
  status: string;
  student: {
    name: string;
    fatherName: string | null;
  };
}

interface MarkPaidDialogProps {
  fee: FeeWithStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MarkPaidDialog({
  fee,
  open,
  onOpenChange,
  onSuccess,
}: MarkPaidDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const totalAmount = Number(fee?.amount ?? 0);
  const alreadyPaid = Number(fee?.paidAmount ?? 0);
  const remaining = totalAmount - alreadyPaid;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      paidAmount: String(remaining),
      paymentDate: new Date().toISOString().split("T")[0],
      receiptNo: "",
    },
  });

  async function onSubmit(values: { paidAmount: string; paymentDate: string; receiptNo: string }) {
    if (!fee) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/fees/${fee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidAmount: parseFloat(values.paidAmount),
          paymentDate: values.paymentDate,
          receiptNo: values.receiptNo || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Error");

      toast.success("Payment record ho gayi ✓");
      onOpenChange(false);
      onSuccess();
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Mark Karo</DialogTitle>
        </DialogHeader>

        {/* Fee Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Student</span>
            <span className="font-medium">{fee.student.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Month</span>
            <span className="font-medium">
              {MONTHS[fee.month - 1]} {fee.year}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-medium">
              Rs. {totalAmount.toLocaleString("en-PK")}
            </span>
          </div>
          {alreadyPaid > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Already Paid</span>
              <span className="font-medium text-green-600">
                Rs. {alreadyPaid.toLocaleString("en-PK")}
              </span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Remaining</span>
            <span className="text-amber-600">
              Rs. {remaining.toLocaleString("en-PK")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Paid (Rs.)*</label>
            <Input
              type="number"
              max={remaining}
              step="0.01"
              {...register("paidAmount")}
            />
            <p className="text-xs text-gray-400">
              Total: Rs. {totalAmount.toLocaleString("en-PK")} | Remaining: Rs.{" "}
              {remaining.toLocaleString("en-PK")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Date*</label>
            <Input type="date" {...register("paymentDate")} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Receipt No (Optional)</label>
            <Input
              placeholder="Auto-generate hoga agar khali choro"
              {...register("receiptNo")}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Save ho raha hai...
                </>
              ) : (
                "Payment Save Karo"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}