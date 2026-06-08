"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Kuch masla aa gaya
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        Dashboard load nahi ho saka. Dobara try karo.
      </p>
      <Button onClick={reset} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Dobara Try Karo
      </Button>
    </div>
  );
}