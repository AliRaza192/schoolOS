export default function StructuredData() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SchoolOS Pakistan",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    description:
      "School management system for Pakistani schools. Attendance, fees, AI report cards, parent portal.",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "1500",
      highPrice: "5000",
      priceCurrency: "PKR",
      offerCount: "3",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "47",
    },
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SchoolOS Pakistan",
    url: "https://schoolos.pk",
    logo: "https://schoolos.pk/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: ["https://schoolos.pk"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}