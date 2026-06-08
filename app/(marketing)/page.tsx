import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  DollarSign,
  Sparkles,
  Users,
  FileText,
  Smartphone,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "School Management System Pakistan",
  description:
    "Pakistan ka sabse aasaan school management system. 14-day free trial, koi credit card nahi.",
};

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Attendance",
    desc: "Ek click, poori class ki attendance",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: DollarSign,
    title: "Fee Management",
    desc: "Auto reminders, digital receipts",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Sparkles,
    title: "AI Report Cards",
    desc: "Gemini AI se auto professional comments",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Users,
    title: "Parent Portal",
    desc: "Parents ko updates WhatsApp par",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: FileText,
    title: "Exam Results",
    desc: "Auto grades, class positions",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    desc: "Phone se bhi poora kaam",
    color: "bg-cyan-100 text-cyan-600",
  },
];

const PROBLEMS = [
  { emoji: "📋", text: "Register mein attendance track karna mushkil hai" },
  { emoji: "💰", text: "Fee defaults track nahi ho pate aur paise dubte hain" },
  { emoji: "📊", text: "Report cards manually likhne mein ghante lagte hain" },
];

const STEPS = [
  {
    num: "1",
    title: "Sign up karo — 2 min",
    desc: "School naam aur details enter karo. Koi credit card nahi chahiye.",
  },
  {
    num: "2",
    title: "Students add karo — 5 min",
    desc: "Classes banao, students enroll karo. Import bhi kar sakte ho.",
  },
  {
    num: "3",
    title: "Kaam shuru karo",
    desc: "Attendance, fees, reports — sab ready hai pehle din se.",
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "1,500",
    desc: "Chhoti schools ke liye",
    color: "border-gray-200",
    badge: null,
    features: [
      "200 students tak",
      "Attendance tracking",
      "Fee management",
      "Exam results",
      "Timetable",
    ],
  },
  {
    name: "Pro",
    price: "3,000",
    desc: "Growing schools ke liye",
    color: "border-blue-500",
    badge: "Most Popular",
    features: [
      "Unlimited students",
      "Sab Basic features",
      "AI Report Cards ✨",
      "Parent Portal",
      "WhatsApp Alerts",
    ],
  },
  {
    name: "Academy",
    price: "5,000",
    desc: "Academy chains ke liye",
    color: "border-purple-500",
    badge: null,
    features: [
      "Sab Pro features",
      "Multi-branch support",
      "Staff Payroll",
      "Custom branding",
      "Priority support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SchoolOS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Blog
            </Link>
            <Link
              href="/cities"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Cities
            </Link>
            <Link
              href="/compare"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Compare
            </Link>
            <Link
              href="/demo"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Demo
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="hidden sm:flex">
                Free Trial Shuru Karo
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-blue-100 text-blue-700 mb-6 text-sm px-4 py-1.5">
            🇵🇰 Pakistan ke liye banaya gaya
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Pakistan ka <span className="text-blue-600">Sabse Aasaan</span>
            <br />
            School Management System
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Attendance, fees, results aur parents — sab kuch ek jagah.
            <br />
            <strong className="text-gray-700">
              Excel chhodo, SchoolOS apnao.
            </strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold w-full sm:w-auto"
              >
                14-Day Free Trial Shuru Karo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg w-full sm:w-auto"
              >
                Live Demo Dekhein
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Koi credit card nahi
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />5 minute setup
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Pakistani schools ke liye
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-lg mx-auto">
            {[
              { num: "5 min", label: "Setup Time" },
              { num: "14 din", label: "Free Trial" },
              { num: "Rs. 0", label: "Setup Cost" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.num}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Kya aap bhi yeh problems face kar rahe hain?
          </h2>
          <p className="text-gray-500 mb-10">
            Pakistan ke 80% schools abhi bhi manually kaam karte hain
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {PROBLEMS.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-red-100 p-6 text-center"
              >
                <span className="text-4xl mb-3 block">{p.emoji}</span>
                <p className="text-gray-700 font-medium">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xl font-semibold text-blue-600">
            SchoolOS in sab ka hal hai ↓
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Ek Platform, Sab Kuch
            </h2>
            <p className="text-gray-500">
              Jo bhi school ko chahiye, sab yahan hai
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              3 Simple Steps
            </h2>
            <p className="text-gray-500">
              Shuru karne mein sirf 7 minute lagte hain
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Simple Pricing
            </h2>
            <p className="text-gray-500">
              Pakistani schools ke liye affordable plans
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border-2 p-6 relative ${plan.color}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      {plan.badge}
                    </Badge>
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
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button
                    className="w-full"
                    variant={plan.badge ? "default" : "outline"}
                  >
                    Free Trial Shuru Karo
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">
            Sab plans mein 14-day free trial shamil hai
          </p>
        </div>
      </section>

      {/* WHY SCHOOLOS */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pakistani Schools Ke Liye Kyun?
            </h2>
            <p className="text-gray-500">
              SchoolOS sirf software nahi — Pakistan ki school management ka hal hai
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🇵🇰",
                title: "Pakistan Ke Liye Banaya",
                desc: "PKR pricing, EasyPaisa payment, Roman Urdu interface — sab kuch Pakistani schools ke hisaab se.",
              },
              {
                icon: "💰",
                title: "Affordable Pricing",
                desc: "Rs. 1,500/month se shuru. Koi hidden charges nahi. 14 din free trial.",
              },
              {
                icon: "⚡",
                title: "5 Minute Setup",
                desc: "Koi technical knowledge nahi chahiye. Sign up karo, students add karo, kaam shuru.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 text-center"
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Abhi Try Karo — Bilkul Free
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            14 din ka free trial. Koi card nahi. Setup 5 minute mein.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 h-14 px-8 text-lg font-semibold w-full sm:w-auto"
              >
                Free Trial Shuru Karo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-blue-700 h-14 px-8 text-lg w-full sm:w-auto"
              >
                Demo Dekhein
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-white text-lg">SchoolOS</span>
              </div>
              <p className="text-sm leading-relaxed">
                Pakistan ka sabse aasaan school management system.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="#features" className="block hover:text-white">
                  Features
                </Link>
                <Link href="/pricing" className="block hover:text-white">
                  Pricing
                </Link>
                <Link href="/demo" className="block hover:text-white">
                  Demo
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block hover:text-white">
                  Contact
                </Link>
                <a
                  href="mailto:support@schoolos.pk"
                  className="block hover:text-white"
                >
                  support@schoolos.pk
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/privacy" className="block hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block hover:text-white">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm">
              © 2025 SchoolOS Pakistan. All rights reserved.
            </p>
            <p className="text-sm">Made with ❤️ for Pakistani schools</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
