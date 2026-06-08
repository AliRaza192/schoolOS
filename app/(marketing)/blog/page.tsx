import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog - School Management Tips",
  description:
    "Pakistani schools ke liye school management tips, attendance tracking guides, fee management advice aur AI features ke baare mein articles.",
};

export const BLOG_POSTS = [
  {
    slug: "school-fee-management-pakistan",
    title: "Pakistan Mein School Fee Management Kaise Karein",
    excerpt:
      "Manual registers se digital system tak ka safar. Pakistani school owners ke liye complete guide fee management ke baare mein.",
    date: "2025-01-15",
    readTime: "5 min",
    category: "Fee Management",
  },
  {
    slug: "attendance-tracking-best-practices",
    title: "School Attendance Track Karne Ke Best Tarike",
    excerpt:
      "Daily attendance management tips Pakistani schools ke liye. Register se app tak — kya better hai aur kyun?",
    date: "2025-01-10",
    readTime: "4 min",
    category: "Attendance",
  },
  {
    slug: "ai-report-cards-pakistan",
    title: "AI Se Report Cards Kaise Banayein",
    excerpt:
      "Gemini AI se professional report card comments auto-generate karein. Pakistani school teachers ke liye step-by-step guide.",
    date: "2025-01-05",
    readTime: "6 min",
    category: "AI Features",
  },
  {
    slug: "private-school-software-comparison",
    title: "Pakistan Ke School Software Ki Comparison 2025",
    excerpt:
      "SchoolOS vs competitors — honest comparison. Kaunsa software aapke school ke liye best hai? Prices, features, support sab compare karo.",
    date: "2024-12-28",
    readTime: "8 min",
    category: "Comparison",
  },
  {
    slug: "school-management-system-benefits",
    title: "School Management System Se Kiya Fayde Hain",
    excerpt:
      "10 reasons why Pakistani schools need digital management. Time bachao, paise bachao, parents ko khush rakho.",
    date: "2024-12-20",
    readTime: "5 min",
    category: "General",
  },
];

const CATEGORIES = ["All", "Fee Management", "Attendance", "AI Features", "Comparison", "General"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
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
            <Button>Free Trial</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            School Management Blog
          </h1>
          <p className="text-gray-500 text-lg">
            Pakistani schools ke liye helpful guides aur tips
          </p>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} read
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(post.date)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Poora Padhein
                  <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}