"use client";

import Link from "next/link";
import { CreditCard, User, Bell, Shield } from "lucide-react";

const settingsLinks = [
  {
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    title: "Billing & Plan",
    desc: "Subscription manage karo, plan upgrade karo",
    color: "text-blue-600 bg-blue-50",
  },
  {
    href: "/dashboard/settings/profile",
    icon: User,
    title: "Profile",
    desc: "School info aur admin details update karo",
    color: "text-green-600 bg-green-50",
  },
  {
    href: "/dashboard/settings/notifications",
    icon: Bell,
    title: "Notifications",
    desc: "Email aur alert preferences",
    color: "text-amber-600 bg-amber-50",
  },
  {
    href: "/dashboard/settings/billing/admin",
    icon: Shield,
    title: "Admin Panel",
    desc: "Super admin — subscription requests",
    color: "text-purple-600 bg-purple-50",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow cursor-pointer flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.color}`}>
                <link.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{link.title}</p>
                <p className="text-sm text-gray-400">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}