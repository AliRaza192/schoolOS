"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Users, CalendarCheck, CreditCard,
  Sparkles, CheckCircle, Circle, ChevronRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  actionLabel: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface OnboardingWizardProps {
  initialSteps: Step[];
  initialCompleted: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Users,
  CalendarCheck,
  CreditCard,
  Sparkles,
};

export default function OnboardingWizard({
  initialSteps,
  initialCompleted,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [steps, setSteps] = useState(initialSteps);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("wizard_dismissed");
    if (dismissed === "true") setIsDismissed(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem("wizard_dismissed", "true");
    setIsDismissed(true);
  }

  if (isDismissed || isCompleted) return null;

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">
            🎯 Setup Karo SchoolOS — 5 min kaam
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {completedCount}/{steps.length} steps complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => {
          const Icon = ICON_MAP[step.icon] ?? BookOpen;
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                step.isCurrent && "bg-blue-50 border border-blue-200",
                step.isCompleted && "opacity-60"
              )}
            >
              {/* Status Icon */}
              {step.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : step.isCurrent ? (
                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}

              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  step.isCompleted
                    ? "text-green-500"
                    : step.isCurrent
                    ? "text-blue-600"
                    : "text-gray-300"
                )}
              />

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.isCompleted
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  )}
                >
                  {step.title}
                </p>
                {step.isCurrent && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>

              {step.isCurrent && (
                <Button
                  size="sm"
                  className="flex-shrink-0 h-7 text-xs"
                  onClick={() => router.push(step.action)}
                >
                  {step.actionLabel}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}