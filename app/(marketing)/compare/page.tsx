import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "SchoolOS vs Other School Software Pakistan",
  description:
    "SchoolOS vs generic school management systems vs Excel. Honest comparison for Pakistani schools. Price, features, support sab compare karo.",
};

const COMPARISON = [
  { feature: "Monthly Price", schoolos: "Rs. 1,500", generic: "Rs. 10,000+", excel: "Free" },
  { feature: "Setup Cost", schoolos: "Free", generic: "Rs. 50,000+", excel: "Free" },
  { feature: "Setup Time", schoolos: "5 minutes", generic: "Days/weeks", excel: "N/A" },
  { feature: "AI Report Cards", schoolos: true, generic: false, excel: false },
  { feature: "Pakistani Context (PKR)", schoolos: true, generic: "Partial", excel: false },
  { feature: "EasyPaisa Payment", schoolos: true, generic: false, excel: false },
  { feature: "Parent Portal", schoolos: true, generic: "Sometimes", excel: false },
  { feature: "WhatsApp Integration", schoolos: true, generic: false, excel: false },
  { feature: "Free Trial", schoolos: "14 days", generic: false, excel: false },
  { feature: "Mobile Friendly", schoolos: true, generic: "Partial", excel: false },
  { feature: "Support", schoolos: "WhatsApp", generic: "Email only", excel: false },
  { feature: "Data Backup", schoolos: "Cloud auto", generic: "Manual", excel: false },
];

function CompareCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  }
  if (value) {
    return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
  }
  return <XCircle className="w-5 h-5 text-red-300 mx-auto" />;
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SchoolOS</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SchoolOS vs Other School Software
          </h1>
          <p className="text-gray-500 text-lg">
            Pakistan ke schools ke liye honest comparison
          </p>
        </div>

        {/* Winner Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-blue-800 font-semibold text-lg">
            🏆 Pakistani private schools ke liye SchoolOS sabse affordable aur feature-rich option hai
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Rs. 1,500/month mein jo features milte hain, woh competitors Rs. 10,000+ mein dete hain
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Feature
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">
                    SchoolOS ⭐
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Generic SMS
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Excel/Manual
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">
                      {row.feature}
                    </td>
                    <td className="px-6 py-3 text-center bg-blue-50/30">
                      <CompareCell value={row.schoolos} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <CompareCell value={row.generic} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <CompareCell value={row.excel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why SchoolOS */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Kyun Choose Karein SchoolOS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Pakistan Ke Liye Banaya",
                desc: "PKR currency, Pakistani phone numbers, EasyPaisa/JazzCash — sab kuch Pakistani context mein",
              },
              {
                title: "AI Features Included",
                desc: "Gemini AI se automatic report card comments — koi competitor yeh nahi deta is price mein",
              },
              {
                title: "Aasaan Setup",
                desc: "5 minute mein ready. Koi training nahi chahiye. Koi IT expert nahi chahiye.",
              },
              {
                title: "Affordable Price",
                desc: "Rs. 1,500/month — ek student ki fee se bhi kam. ROI pehle din se positive.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm ml-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            Free Switch Karo — 14 Din Trial
          </h2>
          <p className="text-blue-100 mb-6">
            Koi data migration nahi chahiye. Koi contract nahi. Koi risk nahi.
          </p>
          <Link href="/sign-up">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-8 font-semibold">
              Free Trial Shuru Karo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}