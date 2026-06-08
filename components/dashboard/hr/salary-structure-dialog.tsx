"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { calculateSalaryStructure } from "@/lib/payroll";

interface SalaryStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  staffName: string;
  currentStructure: any;
  onSuccess: () => void;
}

export default function SalaryStructureDialog({
  open,
  onOpenChange,
  staffId,
  staffName,
  currentStructure,
  onSuccess,
}: SalaryStructureDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    basicSalary: "",
    houseRent: "0",
    medicalAllowance: "0",
    transportAllowance: "0",
    otherAllowances: "0",
    providentFund: "0",
    incomeTax: "0",
    otherDeductions: "0",
    effectiveFrom: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (currentStructure) {
      setForm({
        basicSalary: String(currentStructure.basicSalary ?? ""),
        houseRent: String(currentStructure.houseRent ?? "0"),
        medicalAllowance: String(currentStructure.medicalAllowance ?? "0"),
        transportAllowance: String(currentStructure.transportAllowance ?? "0"),
        otherAllowances: String(currentStructure.otherAllowances ?? "0"),
        providentFund: String(currentStructure.providentFund ?? "0"),
        incomeTax: String(currentStructure.incomeTax ?? "0"),
        otherDeductions: String(currentStructure.otherDeductions ?? "0"),
        effectiveFrom: currentStructure.effectiveFrom ?? new Date().toISOString().split("T")[0],
      });
    }
  }, [currentStructure]);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Live preview
  const preview = calculateSalaryStructure({
    basicSalary: Number(form.basicSalary) || 0,
    houseRent: Number(form.houseRent) || 0,
    medicalAllowance: Number(form.medicalAllowance) || 0,
    transportAllowance: Number(form.transportAllowance) || 0,
    otherAllowances: Number(form.otherAllowances) || 0,
    providentFund: Number(form.providentFund) || 0,
    incomeTax: Number(form.incomeTax) || 0,
    otherDeductions: Number(form.otherDeductions) || 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.basicSalary || Number(form.basicSalary) <= 0) {
      toast.error("Basic salary required hai");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/staff/${staffId}/salary-structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basicSalary: Number(form.basicSalary),
          houseRent: Number(form.houseRent),
          medicalAllowance: Number(form.medicalAllowance),
          transportAllowance: Number(form.transportAllowance),
          otherAllowances: Number(form.otherAllowances),
          providentFund: Number(form.providentFund),
          incomeTax: Number(form.incomeTax),
          otherDeductions: Number(form.otherDeductions),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Salary structure save nahi ho saki");

      toast.success("Salary structure save ho gayi!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Salary Structure - {staffName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-green-700">EARNINGS</h3>
              <div>
                <Label>Basic Salary *</Label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={form.basicSalary}
                  onChange={(e) => handleChange("basicSalary", e.target.value)}
                />
              </div>
              <div>
                <Label>House Rent</Label>
                <Input
                  type="number"
                  value={form.houseRent}
                  onChange={(e) => handleChange("houseRent", e.target.value)}
                />
              </div>
              <div>
                <Label>Medical Allowance</Label>
                <Input
                  type="number"
                  value={form.medicalAllowance}
                  onChange={(e) => handleChange("medicalAllowance", e.target.value)}
                />
              </div>
              <div>
                <Label>Transport Allowance</Label>
                <Input
                  type="number"
                  value={form.transportAllowance}
                  onChange={(e) => handleChange("transportAllowance", e.target.value)}
                />
              </div>
              <div>
                <Label>Other Allowances</Label>
                <Input
                  type="number"
                  value={form.otherAllowances}
                  onChange={(e) => handleChange("otherAllowances", e.target.value)}
                />
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-red-700">DEDUCTIONS</h3>
              <div>
                <Label>Provident Fund</Label>
                <Input
                  type="number"
                  value={form.providentFund}
                  onChange={(e) => handleChange("providentFund", e.target.value)}
                />
              </div>
              <div>
                <Label>Income Tax</Label>
                <Input
                  type="number"
                  value={form.incomeTax}
                  onChange={(e) => handleChange("incomeTax", e.target.value)}
                />
              </div>
              <div>
                <Label>Other Deductions</Label>
                <Input
                  type="number"
                  value={form.otherDeductions}
                  onChange={(e) => handleChange("otherDeductions", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">LIVE PREVIEW</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Gross Salary</p>
                  <p className="text-lg font-bold text-green-600">
                    Rs. {preview.grossSalary.toLocaleString("en-PK")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Deductions</p>
                  <p className="text-lg font-bold text-red-600">
                    Rs. {preview.totalDeductions.toLocaleString("en-PK")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Salary</p>
                  <p className="text-xl font-bold text-blue-600">
                    Rs. {preview.netSalary.toLocaleString("en-PK")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Effective From</Label>
            <Input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => handleChange("effectiveFrom", e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-400">
            Note: Purani salary history save rahegi
          </p>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salary Structure Save Karo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
