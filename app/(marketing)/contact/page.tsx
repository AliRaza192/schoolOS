"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import { MessageSquare, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    schoolName: "",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form:", form);
    toast.success("Message receive ho gaya! Jald rabta karenge.");
    setForm({ name: "", phone: "", schoolName: "", message: "" });
  }

  const whatsappLink =
    "https://wa.me/923001234567?text=SchoolOS%20ke%20baray%20mein%20jaanna%20chahta%20hun";

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
          <Link href="/sign-up">
            <Button size="sm">Free Trial</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Hamse Rabta Karein
          </h1>
          <p className="text-gray-500 text-lg">
            Koi bhi sawaal ho, hum yahan hain!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Options */}
          <div className="space-y-4">
            {/* WhatsApp */}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <div className="bg-[#25D366] rounded-xl p-6 text-white hover:opacity-90 transition-opacity cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">WhatsApp par Message Karo</h3>
                    <p className="text-green-100 text-sm">
                      Fastest response — usually within 1 hour
                    </p>
                  </div>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:support@schoolos.pk">
              <div className="bg-blue-600 rounded-xl p-6 text-white hover:opacity-90 transition-opacity cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email Karein</h3>
                    <p className="text-blue-100 text-sm">support@schoolos.pk</p>
                  </div>
                </div>
              </div>
            </a>

            {/* Info */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm text-gray-500">
              <p>⏰ Support hours: 9 AM — 9 PM (Mon-Sat)</p>
              <p>📍 Pakistan (PKT timezone)</p>
              <p>🌐 Urdu aur English mein support available</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Message Bhejein</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Aapka Naam*</label>
                <Input
                  placeholder="Muhammad Ali"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number*</label>
                <Input
                  placeholder="03XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">School Ka Naam</label>
                <Input
                  placeholder="Al-Noor Academy"
                  value={form.schoolName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, schoolName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Message*</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="Aapka sawaal ya message..."
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Message Bhejein
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}