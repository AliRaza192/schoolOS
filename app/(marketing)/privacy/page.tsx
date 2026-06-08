import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - SchoolOS Pakistan",
  description:
    "SchoolOS Pakistan ki privacy policy. Aapka data kaise use hota hai aur kaise protected hai.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-8">
          Last updated: June 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Hum Kaun Hain
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SchoolOS Pakistan ek school management system hai jo Pakistani schools ke liye banaya gaya hai. Humara maqsad schools ko digital banana hai taake woh apne students, attendance, aur fees ko asaani se manage kar sakein.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Kaunsa Data Collect Hota Hai
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Hum sirf wohi data collect karte hain jo school management ke liye zaroori hai:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li>School ka naam, address, phone number, email</li>
              <li>Admin/teacher ka naam aur email (Clerk auth ke through)</li>
              <li>Students ka naam, father ka naam, class, roll number</li>
              <li>Attendance records</li>
              <li>Fee records</li>
              <li>Exam results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Data Kaise Use Hota Hai
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Aapka data sirf school management features ke liye use hota hai:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li>Attendance track karna</li>
              <li>Fee management aur reminders</li>
              <li>Report cards generate karna (AI ke through)</li>
              <li>Parent portal mein data dikhana</li>
              <li>WhatsApp notifications bhejna</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Data Ki Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Aapka data encrypted hai aur secure servers par store hota hai. Hum Neon PostgreSQL use karte hain jo industry-standard security provide karta hai. Aapka data sirf aapke school ke authorized users access kar sakte hain.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Hum yeh third-party services use karte hain:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-3">
              <li><strong>Clerk</strong> — Authentication ke liye</li>
              <li><strong>Neon</strong> — Database hosting ke liye</li>
              <li><strong>Google Gemini</strong> — AI report cards ke liye</li>
              <li><strong>Resend</strong> — Emails bhejne ke liye</li>
              <li><strong>Vercel</strong> — Hosting ke liye</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Data Delete Karna
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Aap kabhi bhi apna data delete kar sakte hain. Account delete karne ke baad aapka data 30 din ke andar permanently delete ho jayega. Data delete karne ke liye humein{" "}
              <a href="mailto:support@schoolos.pk" className="text-blue-600 underline">
                support@schoolos.pk
              </a>{" "}
              par email karein.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Contact
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Privacy ke baare mein koi sawaal ho toh humein contact karein:
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
