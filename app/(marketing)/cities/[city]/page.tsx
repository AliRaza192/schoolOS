import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAKISTAN_CITIES } from "@/lib/cities-data";

export async function generateStaticParams() {
  return PAKISTAN_CITIES.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = PAKISTAN_CITIES.find((c) => c.slug === slug);
  if (!city) return {};

  return {
    title: `School Management System ${city.name}`,
    description: `${city.name} ke private schools ke liye sabse aasaan school management software. Attendance, fees, AI report cards. Free trial shuru karo.`,
    openGraph: {
      title: `SchoolOS - ${city.name} ka School Management System`,
      description: `${city.name} mein ${city.schools} schools hain. Inhe manage karo ek platform se.`,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = PAKISTAN_CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  const citySchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `SchoolOS Pakistan - ${city.name}`,
    description: `School management system for schools in ${city.name}, ${city.province}`,
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "1500",
      priceCurrency: "PKR",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }}
      />

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

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">
              {city.name}, {city.province}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {city.name} ke Schools ke Liye
            <br />
            <span className="text-blue-600">Pakistan ka Best School Software</span>
          </h1>
          <p className="text-xl text-gray-500 mb-6">
            {city.name} mein <strong>{city.schools}</strong> schools hain.
            Inhe manage karo ek platform se.
            <br />
            {city.localContext}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold">
                Free Trial — {city.name}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                Demo Dekhein
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Koi credit card nahi
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              14-day free trial
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {city.name} mein support
            </span>
          </div>
        </div>
      </section>

      {/* Local Social Proof */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 mb-6">
            Already {city.name} mein schools use kar rahe hain
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mx-auto">
            <p className="text-gray-600 italic mb-3">
              &ldquo;SchoolOS ne hamare {city.neighborhoods[0]} wale school ki
              fee collection 80% improve kar di. Bohot aasaan hai use karna.&rdquo;
            </p>
            <p className="font-semibold text-gray-900 text-sm">
              Muhammad Hassan
            </p>
            <p className="text-gray-400 text-xs">
              Principal, Al-Noor School, {city.neighborhoods[0]}, {city.name}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {city.name} ke Schools ke Liye Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Attendance",
                desc: `${city.name} ke schools ke liye daily attendance system`,
              },
              {
                title: "Fee Management",
                desc: "Digital receipts, EasyPaisa/JazzCash payment tracking",
              },
              {
                title: "AI Report Cards",
                desc: "Gemini AI se professional comments in seconds",
              },
              {
                title: "Parent Portal",
                desc: `${city.name} ke parents ko WhatsApp updates`,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-12 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {city.name} ke in Areas mein Popular hai SchoolOS
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {city.neighborhoods.map((n) => (
              <span
                key={n}
                className="bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium"
              >
                📍 {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {city.name} ke Schools ke Liye Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Basic", price: "1,500", popular: false },
              { name: "Pro", price: "3,000", popular: true },
              { name: "Academy", price: "5,000", popular: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border-2 p-5 ${
                  plan.popular ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 my-2">
                  Rs. {plan.price}
                  <span className="text-sm text-gray-400">/month</span>
                </p>
                <Link href="/sign-up">
                  <Button
                    className="w-full mt-2"
                    variant={plan.popular ? "default" : "outline"}
                    size="sm"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {city.name} ke Schools ke Sawal
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Kiya ${city.name} mein support milega?`,
                a: `Haan! WhatsApp par 24/7 support available hai. ${city.name} ke schools ke liye dedicated support.`,
              },
              {
                q: "Kiya Urdu mein kaam karta hai?",
                a: "Interface English mein hai lekin Pakistani context ke saath — PKR, Pakistani phone numbers, local dates.",
              },
              {
                q: "EasyPaisa se payment kar sakte hain?",
                a: "Haan! EasyPaisa, JazzCash aur bank transfer sab accept hota hai.",
              },
            ].map((faq, i) => (
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
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Aaj hi {city.name} mein SchoolOS Shuru Karo
          </h2>
          <p className="text-blue-100 mb-8">
            14-day free trial. Koi card nahi. Setup 5 minute mein.
          </p>
          <Link href="/sign-up">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 h-14 px-8 text-lg font-semibold">
              Free Trial Shuru Karo — {city.name}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>
          © 2025 SchoolOS Pakistan |{" "}
          <Link href="/" className="hover:text-white">Home</Link> |{" "}
          <Link href="/pricing" className="hover:text-white">Pricing</Link> |{" "}
          <Link href="/cities" className="hover:text-white">Cities</Link>
        </p>
        <p className="mt-2">Made with ❤️ for Pakistani schools</p>
      </footer>
    </div>
  );
}