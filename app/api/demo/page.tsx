"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Users, CalendarCheck, DollarSign, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  async function handleStartDemo() {
    setIsLoading(true);
    setLoadingText("Demo school setup ho rahi hai...");

    try {
      // Redirect to sign up with demo flag
      router.push("/sign-up?demo=true");
    } catch {
      setIsLoading(false);
    }
  }

  const features = [
    { icon: Users, text: "45 students, 3 classes" },
    { icon: CalendarCheck, text: "30 days attendance data" },
    { icon: DollarSign, text: "Fee records with history" },
    { icon: FileText, text: "Exam results with grades" },
    { icon: Sparkles, text: "AI Report Cards (Pro features)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎓 SchoolOS Demo
          </h1>
          <p className="text-gray-500 text-lg">
            Puri system explore karo bina sign up ke!
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">
            Sample school mein:
          </h2>
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">✓ {feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleStartDemo}
          disabled={isLoading}
          className="w-full h-14 text-lg font-semibold rounded-xl shadow-md"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              {loadingText}
            </>
          ) : (
            "🚀 Demo Shuru Karo"
          )}
        </Button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Koi registration nahi chahiye · Bilkul free
        </p>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Apna school register karna hai?{" "}
            <a href="/sign-up" className="text-blue-600 hover:underline font-medium">
              Sign Up Karo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}