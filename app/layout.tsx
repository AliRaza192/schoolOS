import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SchoolOS Pakistan — School Management System",
    template: "%s | SchoolOS Pakistan",
  },
  description:
    "Pakistan ka sabse aasaan school management system. Attendance, fees, results — sab ek jagah.",
  keywords: [
    "school management system pakistan",
    "school software pakistan",
    "attendance system",
    "fee management",
    "schoolos",
  ],
  authors: [{ name: "SchoolOS Pakistan" }],
  openGraph: {
    title: "SchoolOS Pakistan",
    description: "The easiest school management system in Pakistan",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}