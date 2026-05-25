"use client";

import { AlertTriangle, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type BannerType =
  | "student_limit"
  | "trial_expiring"
  | "expired"
  | "feature_locked";

interface PlanLimitBannerProps {
  type: BannerType;
  data?: {
    current?: number;
    limit?: number;
    daysRemaining?: number;
    feature?: string;
  };
}

export default function PlanLimitBanner({ type, data }: PlanLimitBannerProps) {
  const router = useRouter();

  const config = {
    student_limit: {
      icon: AlertTriangle,
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-500",
      text: `⚠️ ${data?.current}/${data?.limit} students used. Upgrade to Pro for unlimited students.`,
      btn: "Upgrade to Pro",
      btnColor: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    trial_expiring: {
      icon: Zap,
      bg: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-500",
      text: `🎉 Trial mein ${data?.daysRemaining} din bache hain. Abhi upgrade karo service continue rakhne ke liye.`,
      btn: "Upgrade Now",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    expired: {
      icon: AlertTriangle,
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-500",
      text: "🔴 Subscription expire ho gayi. Renew karo to access dashboard.",
      btn: "Renew Now",
      btnColor: "bg-red-600 hover:bg-red-700 text-white",
    },
    feature_locked: {
      icon: Lock,
      bg: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-500",
      text: `🔒 ${data?.feature ?? "Yeh feature"} Pro plan mein available hai.`,
      btn: "Upgrade to Pro",
      btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const c = config[type];

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border text-sm",
        c.bg
      )}
    >
      <p className="text-gray-700">{c.text}</p>
      <Button
        size="sm"
        className={cn("ml-4 flex-shrink-0", c.btnColor)}
        onClick={() => router.push("/dashboard/settings/billing")}
      >
        {c.btn}
      </Button>
    </div>
  );
}