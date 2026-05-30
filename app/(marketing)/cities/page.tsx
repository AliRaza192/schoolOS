import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAKISTAN_CITIES } from "@/lib/cities-data";

export const metadata: Metadata = {
  title: "Pakistan ke Sab Shehron Mein SchoolOS",
  description:
    "SchoolOS Pakistan ke har bade shehar mein available hai. Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar.",
};

export default function CitiesPage() {
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

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pakistan ke Sab Shehron Mein SchoolOS
          </h1>
          <p className="text-gray-500 text-lg">
            Karachi se Peshawar tak — har shehar mein available
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAKISTAN_CITIES.map((city) => (
            <Link key={city.slug} href={`/cities/${city.slug}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {city.name}
                    </h2>
                    <p className="text-2xl" dir="rtl">
                      {city.nameUrdu}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {city.province}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{city.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{city.schools} schools</span>
                </div>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Dekhein
                  <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Apne Shehar mein SchoolOS Try Karo
          </h2>
          <p className="text-gray-500 mb-6">
            14-day free trial. Koi credit card nahi.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="h-12 px-8">
              Free Trial Shuru Karo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}