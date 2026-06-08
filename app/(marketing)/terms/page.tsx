import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - SchoolOS Pakistan",
  description:
    "SchoolOS Pakistan ki terms of service. Service use karne se pehle yeh terms padhein.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SchoolOS</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-8">
          Last updated: June 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Service Ki Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SchoolOS Pakistan ek SaaS school management system hai. Hum students, attendance, fees, exams, aur reports manage karne ke tools provide karte hain Pakistani schools ke liye.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Account Banana
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Service use karne ke liye aapko account banana hoga. Aapko sahi information deni hogi. Aap apne account ki security ke zimmedar hain. 14 din ka free trial milta hai — uske baad plan lena hoga.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Pricing aur Payment
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SchoolOS teen plans offer karta hai:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li><strong>Basic:</strong> Rs. 1,500/month — 200 students tak</li>
              <li><strong>Pro:</strong> Rs. 3,000/month — Unlimited students + AI features</li>
              <li><strong>Academy:</strong> Rs. 5,000/month — Multi-branch + priority support</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Payment EasyPaisa, JazzCash, ya bank transfer se ho sakti hai. Subscription manual verification ke baad activate hoti hai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Aapka Data
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Aapka data aapka hai. Hum aapka data kisi third party ko nahi bechte. Aap kabhi bhi apna data export ya delete kar sakte hain. Data ki security ke baare mein zyada jaanne ke liye{" "}
              <Link href="/privacy" className="text-blue-600 underline">
                Privacy Policy
              </Link>{" "}
              padhein.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Service Ki Limitations
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SchoolOS &quot;as-is&quot; provide hota hai. Hum 99.9% uptime ki koshish karte hain lekin guarantee nahi de sakte. Service mein temporary interruptions ho sakte hain maintenance ke liye.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Account Cancel Karna
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Aap kabhi bhi apna account cancel kar sakte hain. Koi cancellation fee nahi hai. Account cancel hone ke baad aapka data 30 din ke baad permanently delete ho jayega.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Terms Mein Changes
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Hum kabhi bhi yeh terms change kar sakte hain. Bade changes ki notification email se milegi. Service use karte rehne se aap naye terms accept karte hain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Contact
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Terms ke baare mein koi sawaal ho toh:
            </p>
            <p className="text-gray-600 mt-2">
              Email:{" "}
              <a href="mailto:support@schoolos.pk" className="text-blue-600 underline">
                support@schoolos.pk
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
