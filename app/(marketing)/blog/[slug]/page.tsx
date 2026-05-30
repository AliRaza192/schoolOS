import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "../page";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

const BLOG_CONTENT: Record<string, string> = {
  "school-fee-management-pakistan": `
## Pakistan Mein School Fee Management Ka Challenge

Pakistan mein private schools ke liye fee collection ek bada masla hai. Har mahine principal sahab ko manually registers check karne padte hain, phone calls karni padti hain, aur phir bhi kuch fees miss ho jati hain.

### Manual System Ki Problems

**1. Time Waste**
Ek school mein average 200 students hain. Har student ki fee manually track karna — yeh kaam hi 2-3 ghante roz leta hai. Yeh waqt teaching ya school improvement mein lag sakta tha.

**2. Errors**
Manual ledgers mein mistakes hoti hain. Kisi ka paid fee unpaid mark ho jata hai, ya vice versa. Parents argue karte hain, trust khatam hota hai.

**3. Follow-up Problem**
Overdue fees ka pata lagana mushkil hai. Alag alag classes, alag alag registers — ek place par data nahi hota.

### Digital Solution: SchoolOS

SchoolOS mein fee management bilkul alag hai:

- **One click generation**: Poori class ki fees ek click mein generate karo
- **Automatic reminders**: Overdue fees auto-mark hongi
- **Digital receipts**: Har payment ka proper record
- **Monthly reports**: Ek screen par sab dekho

### Step by Step Guide

**Step 1**: Dashboard mein "Fees" section kholo

**Step 2**: "Fees Generate Karo" button click karo

**Step 3**: Class select karo, amount enter karo, month select karo

**Step 4**: System automatically sab students ki fees generate kar deta hai

**Step 5**: Payments aate jaate hain, status update karo

### Results

Schools jo SchoolOS use karte hain woh average 80% improvement report karte hain fee collection mein. Kyunki:
- Koi fee miss nahi hoti
- Parents ko WhatsApp reminders milte hain
- Clear records hote hain

## Conclusion

Pakistan ke private schools ke liye digital fee management zarouri hai. Manual registers ka zamana khatam ho gaya. SchoolOS try karo — 14 din free hai, koi card nahi chahiye.
  `,
  "attendance-tracking-best-practices": `
## School Attendance Tracking: Pakistan Ki Reality

Roz subah 8 baje, jab bell bajti hai, teacher ko ek kaam zaroor karna hota hai — attendance. Lekin yeh simple kaam kitna complicated ho sakta hai!

### Register Se App Tak

**Traditional Register:**
- ✗ Pages bharni padti hain
- ✗ Data manually count karna
- ✗ Parents ko baat karni ho to dhundna parta hai
- ✗ Monthly report banana mushkil

**Digital App (SchoolOS):**
- ✓ Ek click se attendance mark
- ✓ Automatic counting
- ✓ Parents ko instant update
- ✓ Monthly reports ek second mein

### Best Practices

**1. Consistent Time**
Attendance hamesha ek hi waqt par lo — jab class shuru ho. Baad mein lene se data galat ho jata hai.

**2. Real-time Entry**
Jab bhi absent mark karo, fauran system mein daalo. End of day entry inaccurate hoti hai.

**3. Parent Notification**
Absent student ke parents ko fauran batao. SchoolOS se WhatsApp link generate karo aur message karo.

**4. Monthly Review**
Har mahine attendance percentage dekho. 75% se kam wale students ke parents se baat karo.

### SchoolOS Attendance Features

- **One-click bulk marking**: Sab present mark karo, phir absent select karo
- **Class-wise view**: Ek class ki poori attendance ek page par
- **Monthly report**: PDF ready, print karo ya WhatsApp karo
- **Parent portal**: Parents apne bachay ki attendance khud dekh sakte hain

## Start Karo Aaj Hi

14-day free trial mein attendance feature try karo. Koi training nahi chahiye — itna simple hai.
  `,
  "ai-report-cards-pakistan": `
## AI Report Cards: Pakistani Schools Ka Naya Tarika

Report card likhna teachers ke liye ek mushkil kaam hai. 30 students, har ek ke liye alag comment, meaningful hona chahiye, professional hona chahiye — yeh kaam ghante leta hai.

### AI Kya Karta Hai?

SchoolOS mein Gemini AI use kiya gaya hai — Google ka sabse advanced AI model. Yeh AI:

1. Student ka attendance percentage dekhta hai
2. Fee status consider karta hai  
3. Teacher ka note padhta hai
4. Professional, encouraging comment generate karta hai

### Example

**Student**: Ahmad Ali
**Attendance**: 85%
**AI Generated Comment**:
*"Ahmad has shown commendable dedication this month with an attendance of 85%. His consistent presence in class demonstrates a positive attitude toward learning. We encourage Ahmad to maintain this momentum and aim for even greater academic achievements in the coming months."*

### Kaise Use Karein

**Step 1**: Dashboard mein "Reports" click karo

**Step 2**: Class aur month select karo

**Step 3**: Teacher note add karo (optional):
*"Yeh students ki performance bahut achi rahi is mahine"*

**Step 4**: "Generate Reports" click karo

**Step 5**: 1-2 minute mein sab students ke comments ready

### Edit Karo

AI ka comment pasand nahi? Edit kar sakte ho! Har comment ke saath edit button hai. Customize karo apne style mein.

### Print Karo

"Print All Slips" se sab students ke result cards ek saath print hote hain. School ka naam, student info, attendance, grades sab automatically aata hai.

## Pakistani Parents Ko Impress Karo

Professional AI-generated comments parents ko bohot impress karte hain. Yeh feature sirf Pro plan mein available hai.
  `,
  "private-school-software-comparison": `
## Pakistan Ke School Software 2025: Honest Comparison

School software choose karna ek important decision hai. Galat choice se paise aur waqt dono waste hote hain. Yeh comparison aapki madad karega.

### Options

**1. SchoolOS** (Hamara product — honest review)
**2. Generic SMS (School Management Systems)**
**3. Excel/Manual Registers**

### Price Comparison

| | SchoolOS | Generic SMS | Excel |
|---|---|---|---|
| Monthly Cost | Rs. 1,500 | Rs. 10,000+ | Free |
| Setup Cost | Free | Rs. 50,000+ | Free |
| Training | Not needed | Weeks | None |

### Features

**SchoolOS ke Advantages:**
- Pakistani context (PKR, Pakistani phones, local names)
- EasyPaisa/JazzCash payment tracking
- AI Report Cards (unique feature)
- WhatsApp integration
- 14-day free trial
- 5-minute setup

**Generic SMS:**
- Often made for India or other markets
- Expensive, complex setup
- No AI features
- Bank transfer only

**Excel:**
- Free but no automation
- Manual everything
- No parent portal
- No mobile access

### Our Honest Assessment

SchoolOS best hai agar:
- Aap Pakistani private school chalate hain
- 20-500 students hain
- Digital solution chahiye lekin complicated nahi

Generic SMS better hai agar:
- 500+ students hain
- Payroll aur HR bhi chahiye
- Budget zyada hai

## Try Karo Pehle

14-day free trial mein khud test karo. Koi commitment nahi.
  `,
  "school-management-system-benefits": `
## 10 Reasons: School Management System Kyun Zarouri Hai

Pakistan mein abhi bhi 80% private schools manually kaam karte hain. Yeh 10 reasons batate hain kyun digital system zarouri hai.

### 1. Time Bachao

Manual attendance: 15-20 min/day per class
Digital attendance: 2-3 min/day per class

Monthly saving per teacher: 5-6 hours
School-wide: Zyada time teaching pe

### 2. Fee Collection Improve Karo

Schools jo digital fee tracking use karte hain:
- 80% less fee defaults
- Faster payment
- Clear records

### 3. Parents Ko Khush Rakho

Aaj ke parents information chahte hain:
- "Aaj mera bacha school gaya?"
- "Is mahine ki fee baki hai?"
- "Report card kab milega?"

Parent portal se yeh sab automatically milta hai.

### 4. Exam Results Professionally Manage Karo

Manual results mein:
- Calculation errors
- Position calculation mushkil
- No grade tracking over time

Digital mein:
- Auto grade calculation
- Auto positions
- Historical tracking

### 5. Professional Image Banao

Digital receipts, professional report cards, parent portal — parents impressed hote hain. Word of mouth se new admissions milte hain.

### 6. Data Safety

Physical registers:
- Fire/flood se destroy ho sakte hain
- Lost/damaged

Cloud backup:
- Always safe
- Access anywhere

### 7. Staff Efficiency

Teachers jab administration pe kam time lagate hain, teaching pe zyada lagate hain. Result: better student outcomes.

### 8. Compliance

Government kabhi kabhi attendance records maangti hai. Digital records always ready rehte hain.

### 9. Scalability

School grow karna chahte ho? Digital system scale karta hai — new students, new classes sab easily add hote hain.

### 10. Competitive Advantage

Jab parents compare karte hain schools, digital features matter karte hain. SchoolOS use karne wala school modern lagta hai.

## Conclusion

Digital school management optional nahi, zaruri hai. SchoolOS se shuru karo — 14-day free trial, koi risk nahi.
  `,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## "))
      return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.slice(3)}</h2>;
    if (line.startsWith("### "))
      return <h3 key={i} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{line.slice(4)}</h3>;
    if (line.startsWith("**") && line.endsWith("**"))
      return <p key={i} className="font-semibold text-gray-800 mt-2">{line.slice(2, -2)}</p>;
    if (line.startsWith("- ✗ "))
      return <p key={i} className="text-red-600 ml-4">✗ {line.slice(4)}</p>;
    if (line.startsWith("- ✓ "))
      return <p key={i} className="text-green-600 ml-4">✓ {line.slice(4)}</p>;
    if (line.startsWith("- "))
      return <p key={i} className="text-gray-600 ml-4 my-1">• {line.slice(2)}</p>;
    if (line.startsWith("*") && line.endsWith("*"))
      return <p key={i} className="text-gray-600 italic bg-gray-50 p-3 rounded-lg my-3">{line.slice(1, -1)}</p>;
    if (line.trim() === "") return <div key={i} className="h-3" />;
    return <p key={i} className="text-gray-600 leading-relaxed my-2">{line}</p>;
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const content = BLOG_CONTENT[slug] ?? "";

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: "SchoolOS Pakistan" },
    publisher: { "@type": "Organization", name: "SchoolOS Pakistan" },
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
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
          <Link href="/sign-up">
            <Button size="sm">Free Trial</Button>
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href="/blog"
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Blog par wapas jao
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{formatDate(post.date)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} read
            </span>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-xl text-gray-500 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">
          {post.excerpt}
        </p>

        {/* Content */}
        <div className="prose max-w-none">
          {renderContent(content)}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            SchoolOS Try Karo — Free Trial
          </h2>
          <p className="text-blue-100 mb-6">
            14 din ka free trial. Koi credit card nahi. Setup 5 minute mein.
          </p>
          <Link href="/sign-up">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-8 font-semibold">
              Free Trial Shuru Karo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="font-bold text-gray-900 mb-4">Aur Padhein</h3>
          <div className="space-y-3">
            {BLOG_POSTS.filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-400">{related.readTime} read</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}