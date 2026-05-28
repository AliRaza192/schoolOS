"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CreditCard, User, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface SchoolData {
  id: string;
  name: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  plan: string;
  planExpiresAt: string | null;
}

export default function SettingsPage() {
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function fetchSchool() {
      try {
        const res = await fetch("/api/subscriptions");
        const data = await res.json();
        // Get school from user context
        const userRes = await fetch("/api/dashboard/stats");
        // Fetch school info via a simpler approach
        const schoolRes = await fetch("/api/settings/school");
        if (schoolRes.ok) {
          const schoolData = await schoolRes.json();
          setSchool(schoolData.school);
          setForm({
            name: schoolData.school.name ?? "",
            city: schoolData.school.city ?? "",
            phone: schoolData.school.phone ?? "",
            address: schoolData.school.address ?? "",
          });
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchool();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/school", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      toast.success("Settings save ho gayi!");
      setSchool(data.school);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsSaving(false);
    }
  }

  const daysRemaining = school?.planExpiresAt
    ? Math.ceil(
        (new Date(school.planExpiresAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* School Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          School Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">School Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="School name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">City</label>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="City"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="03XXXXXXXXX"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="School address"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Save ho raha hai...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Plan & Billing */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Plan & Billing
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              Current Plan:{" "}
              <span className="capitalize text-blue-600">{school?.plan ?? "basic"}</span>
            </p>
            {daysRemaining > 0 && (
              <p className="text-sm text-gray-400">{daysRemaining} days remaining</p>
            )}
          </div>
          <Badge className="capitalize bg-blue-100 text-blue-700">
            {school?.plan ?? "basic"}
          </Badge>
        </div>

        <Link href="/dashboard/settings/billing">
          <Button variant="outline" className="w-full">
            Billing & Plan Manage Karo →
          </Button>
        </Link>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-5 space-y-4">
        <h2 className="font-semibold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-red-600">
          Yeh actions reversible nahi hain. Bohot soach kar karein.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => toast.error("Is feature ke liye support se contact karein")}
          >
            Sab Data Reset Karo
          </Button>
        </div>
      </div>
    </div>
  );
}