"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DESIGNATIONS, DEPARTMENTS } from "@/lib/payroll";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function StaffFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: StaffFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    cnic: "",
    phone: "",
    designation: "",
    department: "",
    joiningDate: new Date().toISOString().split("T")[0],
    basicSalary: "",
  });

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.designation || !form.basicSalary) {
      toast.error("Name, designation aur salary required hain");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basicSalary: Number(form.basicSalary),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Staff add nahi ho saka");

      toast.success("Staff add ho gaya!");
      onOpenChange(false);
      setForm({
        name: "",
        fatherName: "",
        cnic: "",
        phone: "",
        designation: "",
        department: "",
        joiningDate: new Date().toISOString().split("T")[0],
        basicSalary: "",
      });
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kuch gadbad ho gayi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Staff Add Karo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Employee Name *</Label>
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label>Father Name</Label>
              <Input
                placeholder="Father ka naam"
                value={form.fatherName}
                onChange={(e) => handleChange("fatherName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CNIC</Label>
              <Input
                placeholder="XXXXX-XXXXXXX-X"
                value={form.cnic}
                onChange={(e) => handleChange("cnic", e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="03XX-XXXXXXX"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Designation *</Label>
              <Select value={form.designation} onValueChange={(v) => handleChange("designation", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select karo" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => handleChange("department", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select karo" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Joining Date *</Label>
              <Input
                type="date"
                value={form.joiningDate}
                onChange={(e) => handleChange("joiningDate", e.target.value)}
              />
            </div>
            <div>
              <Label>Basic Salary (Rs.) *</Label>
              <Input
                type="number"
                placeholder="Jaise: 25000"
                value={form.basicSalary}
                onChange={(e) => handleChange("basicSalary", e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Staff Add Karo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
