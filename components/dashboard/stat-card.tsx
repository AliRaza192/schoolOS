import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  icon: LucideIcon;
  color: "blue" | "green" | "amber" | "purple";
  subLabel?: string;
  isLoading?: boolean;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    value: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    value: "text-green-700",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    value: "text-amber-700",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    value: "text-purple-700",
  },
};

export default function StatCard({
  title,
  value,
  label,
  icon: Icon,
  color,
  subLabel,
  isLoading,
}: StatCardProps) {
  const colors = colorMap[color];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
      </div>
      <p className={cn("text-3xl font-bold mb-1", colors.value)}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subLabel && (
        <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
      )}
    </div>
  );
}