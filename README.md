# 🏫 SchoolOS Pakistan

> The easiest school management system in Pakistan

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)](https://clerk.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-teal)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

---

## 📌 What is SchoolOS?

SchoolOS Pakistan is a production SaaS platform built for Pakistani private schools, academies, and coaching centers. It replaces manual attendance registers, fee receipt books, and Excel sheets with a fast, simple, and fully digital system.

**Target Market:** 200,000+ private schools · 50,000+ academies across Pakistan

**Business Model:** Monthly SaaS subscription in PKR

---

## 💰 Pricing Plans

| Plan | Price | Students | Key Features |
|---|---|---|---|
| **Basic** | Rs. 1,500/mo | Up to 200 | Attendance, Fee tracking, 1 admin |
| **Pro** | Rs. 3,000/mo | Unlimited | + AI report cards, Parent WhatsApp, 5 staff |
| **Academy** | Rs. 5,000/mo | Unlimited | + Multi-branch, AI insights, Custom branding |

---

## ✨ Features

| Feature | Phase | Status |
|---|---|---|
| School Onboarding & Auth | Phase 0 | ✅ Complete |
| Dashboard with Live Stats | Phase 0 | ✅ Complete |
| Student Management | Phase 1 | 🔨 In Progress |
| Attendance System | Phase 2 | ⏳ Pending |
| Fee Management | Phase 3 | ⏳ Pending |
| AI Report Cards (Gemini) | Phase 4 | ⏳ Pending |
| Subscription & Plan Gating | Phase 5 | ⏳ Pending |
| Parent Portal & Notifications | Phase 6 | ⏳ Pending |
| Exam & Result Management | Phase 7 | ⏳ Pending |
| Timetable & Homework Tracker | Phase 8 | ⏳ Pending |
| Demo & Onboarding Flow | Phase 9 | ⏳ Pending |
| SEO & Marketing Pages | Phase 10 | ⏳ Pending |
| Multi-Branch Academy Support | Phase 12 | ⏳ Pending |
| Staff Payroll & HR | Phase 13 | ⏳ Pending |
| Mobile App (PWA) | Phase 14 | ⏳ Pending |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Best full-stack React framework |
| Language | TypeScript (strict mode) | Type safety, no runtime surprises |
| Styling | Tailwind CSS v4 + Shadcn UI | Fast, consistent, beautiful UI |
| Database | Neon PostgreSQL | Serverless, free tier, fast |
| ORM | Drizzle ORM | Lightweight, type-safe SQL |
| Auth | Clerk | Best-in-class auth, free 10K MAU |
| AI | Google Gemini 2.5 Flash | Free 1500 req/day, fast responses |
| Email | Resend | Simple API, free 3000/mo |
| Deployment | Vercel | Zero-config, free hobby tier |

---

## 🗄️ Database Schema
schools        → One school = one account
users          → Linked to Clerk, scoped to school
classes        → Classes/sections per school
students       → Student profiles, linked to class
attendance     → Daily attendance records
fees           → Monthly fee tracking per student
subscriptions  → SaaS billing records

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free)
- A [Clerk](https://clerk.com) account (free)
- A [Google AI Studio](https://aistudio.google.com) API key (free)
- A [Resend](https://resend.com) account (free)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AliRaza192/schoolos.git
cd schoolos

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your keys in .env.local

# 4. Push database schema
npm run db:push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to Neon (no migration files)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (visual DB browser)
```

---

## 📁 Project Structure

```
schoolos/
├── app/
│   ├── (auth)/                 # Clerk sign-in / sign-up pages
│   ├── (dashboard)/            # Protected school dashboard
│   │   ├── page.tsx            # Dashboard home with stats
│   │   ├── students/           # Student management
│   │   ├── attendance/         # Attendance marking
│   │   ├── fees/               # Fee tracking
│   │   ├── reports/            # AI-generated reports
│   │   └── settings/           # School settings
│   ├── (marketing)/            # Public pages
│   │   ├── page.tsx            # Landing page
│   │   └── pricing/            # Pricing page
│   ├── onboarding/             # New school setup flow
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # Shadcn UI components
│   ├── dashboard/              # Dashboard-specific components
│   └── marketing/              # Landing page components
├── db/
│   ├── schema.ts               # Complete Drizzle schema
│   └── index.ts                # DB connection
├── lib/
│   ├── utils.ts                # Utility functions
│   └── validations/            # Zod validation schemas
└── types/
    └── index.ts                # Global TypeScript types
```

## 🔐 Environment Variables

```bash
# .env.local

DATABASE_URL=                         # Neon PostgreSQL connection string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=    # Clerk publishable key
CLERK_SECRET_KEY=                     # Clerk secret key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
GEMINI_API_KEY=                       # Google AI Studio key
RESEND_API_KEY=                       # Resend API key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔒 Security

- Every API route is protected with Clerk authentication
- All database queries are scoped by `schoolId` — no cross-school data leakage
- TypeScript strict mode enforced throughout
- Zod validation on every form and API endpoint
- Rate limiting on all AI endpoints

---

## 🗺️ Roadmap

### Build Phase — Core Product
- [x] Phase 0: Foundation, Auth & Landing Page
- [ ] Phase 1: Student & Class Management
- [ ] Phase 2: Attendance System
- [ ] Phase 3: Fee Management
- [ ] Phase 4: AI Features (Gemini)

### Earn Phase — Revenue Layer
- [ ] Phase 5: Subscription System + Plan Gating
- [ ] Phase 6: Parent Portal + Notifications
- [ ] Phase 7: Exam & Result Management
- [ ] Phase 8: Timetable & Homework Tracker

### Grow Phase — Client Acquisition
- [ ] Phase 9: Demo + Onboarding Flow
- [ ] Phase 10: SEO + Local Marketing Pages
- [ ] Phase 11: Referral & Affiliate Program

### Scale Phase — Moat Building
- [ ] Phase 12: Multi-Branch Academy Support
- [ ] Phase 13: Staff Payroll & HR
- [ ] Phase 14: Mobile App (PWA)
- [ ] Phase 15: Super Admin Dashboard

---

## 👨‍💻 Developer

**Ali Raza** — [@ali_raza192](https://github.com/AliRaza192)

---

## 📄 License

This project is proprietary software. All rights reserved.

© 2025 SchoolOS Pakistan