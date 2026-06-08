import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact SchoolOS Pakistan",
  description:
    "SchoolOS Pakistan se rabta karein. WhatsApp par baat karein ya message bhejein. Hum Pakistani schools ki madad ke liye yahan hain.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
