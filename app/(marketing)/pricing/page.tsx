import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SchoolOS Pakistan ke affordable plans. Basic Rs.1,500, Pro Rs.3,000, Academy Rs.5,000. 14-day free trial.",
};

const COMPARISON = [
  { feature: "Students", basic: "200 tak", pro: "Unlimited", academy: "Unlimited" },
  { feature: "Attendance", basic: true, pro: true, academy: true },
  { feature: "Fee Management", basic: true, pro: true, academy: true },
  { feature: "Exam Results", basic: true, pro: true, academy: true },
  { feature: "Timetable", basic: true, pro: true, academy: true },
  { feature: "AI Report Cards ✨", basic: false, pro: true, academy: true },
  { feature: "Parent Portal", basic: false, pro: true, academy: true },
  { feature: "WhatsApp Alerts", basic: false, pro: true, academy: true },
  { feature: "Multi-Branch", basic: false, pro: false, academy: true },
  { feature: "Staff Payroll", basic: false, pro: false, academy: true },
  { feature: "Priority Support", basic: false, pro: false, academy: true },
  { feature: "Price/month", basic: "Rs. 1,500", pro: "Rs. 3,000", academy: "Rs. 5,000" },
];

const FAQS = [
  {
    q: "Credit card chahiye?",
    a: "Nahi! EasyPaisa ya JazzCash se pay karo. Bank transfer bhi accept hoti hai.",
  },
  {
    q: "Mera data safe hai?",
    a: "Haan, Neon PostgreSQL par encrypted store hota hai. Aapka data sirf aapka hai.",
  },
  {
    q: "Kitne schools ek account mein?",
    a: "Basic aur Pro mein 1 school. Academy plan mein unlimited branches manage kar sakte hain.",
  },
  {
    q: "Plan cancel kar sakte hain?",
    a: "Haan, kisi bhi waqt. Koi cancellation fee nahi hai.",
  },
  {
    q: "Support kaise milega?",
    a: "WhatsApp aur email se support available hai. Academy users ko dedicated manager milta hai.",
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-gray-900">{value}</span>;
  }
  if (value) {
    return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
  }
  return <XCircle className="w-5 h-5 text-gray-200 mx-auto" />;
}

export default function PricingPage() {
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-lg">
            Pakistani schools ke liye affordable plans. Sab mein 14-day free trial.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Basic",
              price: "1,500",
              desc: "Chhoti schools ke liye",
              color: "border-gray-200",
              popular: false,
            },
            {
              name: "Pro",
              price: "3,000",
              desc: "Growing schools ke liye",
              color: "border-blue-500",
              popular: true,
            },
            {
              name: "Academy",
              price: "5,000",
              desc: "Academy chains ke liye",
              color: "border-purple-500",
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border-2 p-6 relative ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{plan.desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold text-gray-900">
                  Rs. {plan.price}
                </span>
                <span className="text-gray-400">/month</span>
              </div>
              <Link href="/sign-up">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Free Trial Shuru Karo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
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
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
                    Basic
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">
                    Pro ⭐
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-purple-700">
                    Academy
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
                    <td className="px-6 py-3 text-center">
                      <Cell value={row.basic} />
                    </td>
                    <td className="px-6 py-3 text-center bg-blue-50/30">
                      <Cell value={row.pro} />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Cell value={row.academy} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Aksar Pooche Jane Wale Sawal
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Q: {faq.q}
                </h3>
                <p className="text-gray-500 text-sm">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            Ready hai? Abhi shuru karo!
          </h2>
          <p className="text-blue-100 mb-6">
            14-day free trial. Koi credit card nahi chahiye.
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