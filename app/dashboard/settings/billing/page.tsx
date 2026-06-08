"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/subscription";

interface SubscriptionData {
  status: SubscriptionStatus;
  history: {
    id: string;
    plan: string;
    amount: string;
    status: string;
    createdAt: string;
    startDate: string;
    endDate: string;
  }[];
}

const PLANS = [
  {
    id: "basic" as const,
    name: "Basic",
    price: 1500,
    color: "border-gray-200",
    badge: null,
    features: [
      { text: "200 students tak", included: true },
      { text: "Attendance tracking", included: true },
      { text: "Fee management", included: true },
      { text: "Basic reports", included: true },
      { text: "AI Report Cards", included: false },
      { text: "Parent Portal", included: false },
      { text: "Multi-Branch", included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 3000,
    color: "border-blue-500",
    badge: "POPULAR",
    features: [
      { text: "Unlimited students", included: true },
      { text: "Attendance tracking", included: true },
      { text: "Fee management", included: true },
      { text: "AI Report Cards ✨", included: true },
      { text: "Parent Portal", included: true },
      { text: "5 staff users", included: true },
      { text: "Multi-Branch", included: false },
    ],
  },
  {
    id: "academy" as const,
    name: "Academy",
    price: 5000,
    color: "border-purple-500",
    badge: null,
    features: [
      { text: "Unlimited students", included: true },
      { text: "Everything in Pro", included: true },
      { text: "Multi-branch support", included: true },
      { text: "Custom branding", included: true },
      { text: "API access", included: true },
      { text: "Priority support", included: true },
      { text: "Dedicated manager", included: true },
    ],
  },
];

const DURATIONS = [
  { months: 1, label: "1 Month", discount: 0 },
  { months: 3, label: "3 Months", discount: 5 },
  { months: 6, label: "6 Months", discount: 10 },
  { months: 12, label: "12 Months", discount: 15 },
];

const MONTHS_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BillingPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro" | "academy" | null>(null);
  const [dialogStep, setDialogStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/subscriptions");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Billing data load nahi ho saka");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  function getPrice(basePrice: number, months: number, discount: number) {
    return Math.round(basePrice * months * (1 - discount / 100));
  }

  async function handleSubmit() {
    if (!selectedPlan || !paymentMethod || !transactionId) return;
    setIsSubmitting(true);
    try {
      const duration = DURATIONS.find((d) => d.months === selectedDuration)!;
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod,
          paymentProof: transactionId,
          months: selectedDuration,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error");
      setIsSuccess(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentPlan = data?.status;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>

      {/* Current Plan Card */}
      {isLoading ? (
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      ) : currentPlan ? (
        <div
          className={cn(
            "rounded-xl border-2 p-5",
            currentPlan.status === "expired"
              ? "border-red-300 bg-red-50"
              : currentPlan.status === "trial"
              ? "border-blue-300 bg-blue-50"
              : "border-green-300 bg-green-50"
          )}
        >
          {currentPlan.status === "trial" ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-blue-700">Free Trial</h2>
                </div>
                <p className="text-blue-600 mt-1">
                  {currentPlan.daysRemaining} din bache hain — Basic features available
                </p>
              </div>
              <Button onClick={() => setSelectedPlan("pro")}>Upgrade Now</Button>
            </div>
          ) : currentPlan.status === "expired" ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-red-700">
                  ⚠️ Subscription Expired
                </h2>
                <p className="text-red-600 mt-1">
                  Renew karo to continue using SchoolOS
                </p>
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setSelectedPlan("basic")}
              >
                Renew Now
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Current Plan:{" "}
                    <span className="text-green-700 capitalize">
                      {currentPlan.plan}
                    </span>
                  </h2>
                  <Badge className="bg-green-100 text-green-700 mt-1">
                    ✓ Active
                  </Badge>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{currentPlan.daysRemaining} days remaining</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {[
                  {
                    label: "Students",
                    value: currentPlan.limits.maxStudents
                      ? `Up to ${currentPlan.limits.maxStudents}`
                      : "Unlimited",
                    ok: true,
                  },
                  { label: "AI Reports", value: currentPlan.limits.aiReports ? "✓" : "✗", ok: currentPlan.limits.aiReports },
                  { label: "Parent Portal", value: currentPlan.limits.parentPortal ? "✓" : "✗", ok: currentPlan.limits.parentPortal },
                  { label: "Multi-Branch", value: currentPlan.limits.multiBranch ? "✓" : "✗", ok: currentPlan.limits.multiBranch },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-lg p-2 text-center">
                    <p className="text-gray-400 text-xs">{item.label}</p>
                    <p className={cn("font-semibold", item.ok ? "text-green-600" : "text-gray-300")}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Duration Selector */}
      <div className="flex gap-2 flex-wrap">
        {DURATIONS.map((d) => (
          <button
            key={d.months}
            onClick={() => setSelectedDuration(d.months)}
            className={cn(
              "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
              selectedDuration === d.months
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
            )}
          >
            {d.label}
            {d.discount > 0 && (
              <span className="ml-1 text-xs opacity-80">({d.discount}% off)</span>
            )}
          </button>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const duration = DURATIONS.find((d) => d.months === selectedDuration)!;
          const price = getPrice(plan.price, selectedDuration, duration.discount);
          const isCurrent = currentPlan?.plan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "bg-white rounded-xl border-2 p-5 relative",
                plan.color,
                isCurrent && "ring-2 ring-green-400"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">{plan.badge}</Badge>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {price.toLocaleString("en-PK")}
                </span>
                <span className="text-gray-400 text-sm">
                  /{selectedDuration} month{selectedDuration > 1 ? "s" : ""}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Rs. {plan.price.toLocaleString("en-PK")}/month
                </p>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={f.included ? "text-gray-700" : "text-gray-300"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent}
                onClick={() => {
                  setSelectedPlan(plan.id);
                  setDialogStep(1);
                  setIsSuccess(false);
                }}
              >
                {isCurrent ? "Current Plan" : "Select Plan"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Payment Dialog */}
      <Dialog
        open={!!selectedPlan}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlan(null);
            setDialogStep(1);
            setIsSuccess(false);
            setTransactionId("");
            setPaymentMethod("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSuccess
                ? "Request Submitted ✓"
                : dialogStep === 1
                ? "Payment Details"
                : "Submit Payment Proof"}
            </DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">
                Request submit ho gayi!
              </p>
              <p className="text-gray-500 text-sm">
                1-24 hours mein activate ho jayegi. Confirmation email aayega.
              </p>
              <Button onClick={() => setSelectedPlan(null)} className="w-full">
                Done
              </Button>
            </div>
          ) : dialogStep === 1 ? (
            <div className="space-y-4">
              {selectedPlan && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-semibold capitalize">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-semibold">
                        {DURATIONS.find((d) => d.months === selectedDuration)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">
                        Rs.{" "}
                        {getPrice(
                          PLANS.find((p) => p.id === selectedPlan)?.price ?? 0,
                          selectedDuration,
                          DURATIONS.find((d) => d.months === selectedDuration)?.discount ?? 0
                        ).toLocaleString("en-PK")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-semibold text-gray-700">
                      Send payment to:
                    </p>
                    <p>📱 EasyPaisa: <strong>0300-XXXXXXX</strong></p>
                    <p>📱 JazzCash: <strong>0300-XXXXXXX</strong></p>
                    <p>🏦 Bank (HBL): <strong>XXXX-XXXX-XXXX</strong></p>
                  </div>

                  <Button className="w-full" onClick={() => setDialogStep(2)}>
                    Next →
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method*</label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "easypaisa")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                    <SelectItem value="jazzcash">JazzCash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction ID*</label>
                <Input
                  placeholder="EasyPaisa transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  Screenshot lena zaroori nahi, sirf transaction ID kaafi hai
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogStep(1)}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!paymentMethod || !transactionId || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submit ho raha hai...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}