"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  schoolName: string;
  createdAt: string;
}

export default function WelcomeBanner({
  schoolName,
  createdAt,
}: WelcomeBannerProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("welcome_dismissed");
    if (dismissed === "true") setIsDismissed(true);
  }, []);

  // Only show if school created < 24 hours ago
  const isNew =
    new Date().getTime() - new Date(createdAt).getTime() 
    24 * 60 * 60 * 1000;

  if (!isNew || isDismissed) return null;

  function handleDismiss() {
    localStorage.setItem("welcome_dismissed", "true");
    setIsDismissed(true);
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-blue-200 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pr-8">
        <h2 className="text-xl font-bold mb-1">
          👋 Khush Amdeed, {schoolName}!
        </h2>
        <p className="text-blue-100 text-sm mb-3">
          Aapka 14-day free trial shuru ho gaya hai. Koi credit card nahi
          chahiye.
        </p>

        <div className="flex items-center gap-2 text-blue-100 text-sm mb-4">
          <span>📋 Students</span>
          <span>→</span>
          <span>📅 Attendance</span>
          <span>→</span>
          <span>💰 Fees</span>
          <span>→</span>
          <span>📊 Reports</span>
        </div>

        <div className="flex gap-3">
          <Button
            size="sm"
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
            onClick={() => {
              handleDismiss();
              localStorage.removeItem("wizard_dismissed");
            }}
          >
            Setup Wizard Shuru Karo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-100 hover:text-white hover:bg-blue-500"
            onClick={handleDismiss}
          >
            Baad Mein
          </Button>
        </div>
      </div>
    </div>
  );
}