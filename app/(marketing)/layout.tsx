import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SchoolOS Pakistan — School Management System",
    template: "%s | SchoolOS Pakistan",
  },
  description:
    "Pakistan ka sabse aasaan school management system. Attendance, fees, results aur parents - sab kuch ek jagah. 14-day free trial.",
  keywords: [
    "school management system pakistan",
    "school software karachi lahore",
    "attendance system school",
    "fee management school pakistan",
    "schoolos",
  ],
  openGraph: {
    title: "SchoolOS Pakistan — School Management System",
    description:
      "Attendance, fees, results aur parents - sab kuch ek jagah. Excel chhodo, SchoolOS apnao.",
    type: "website",
    locale: "en_PK",
    url: "https://schoolos.pk",
    siteName: "SchoolOS Pakistan",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}