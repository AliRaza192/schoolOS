import type { Metadata } from "next";
import StructuredData from "@/components/marketing/structured-data";
import GoogleAnalytics from "@/components/marketing/google-analytics";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolos.pk"
  ),
  title: {
    default: "SchoolOS Pakistan - School Management System",
    template: "%s | SchoolOS Pakistan",
  },
  description:
    "Pakistan ka sabse aasaan school management system. Attendance, fees, AI report cards, parent portal - sab ek jagah. 14-day free trial shuru karo.",
  keywords: [
    "school management system Pakistan",
    "school software Pakistan",
    "attendance management Pakistan",
    "fee management school",
    "school ERP Pakistan",
    "school management Karachi",
    "school management Lahore",
    "school management system Urdu",
    "academy management system Pakistan",
  ],
  authors: [{ name: "SchoolOS Pakistan" }],
  creator: "SchoolOS Pakistan",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SchoolOS Pakistan",
    title: "SchoolOS - Pakistan ka School Management System",
    description:
      "Attendance, fees, AI report cards aur parent portal - sab ek jagah. 14-day free trial.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SchoolOS Pakistan Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SchoolOS Pakistan",
    description: "Pakistan ka school management system",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData />
      <GoogleAnalytics />
      {children}
    </>
  );
}