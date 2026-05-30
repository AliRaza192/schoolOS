/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://schoolos.pk",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    "/dashboard/*",
    "/onboarding",
    "/api/*",
    "/parent/*",
    "/sign-in",
    "/sign-up",
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/dashboard/" },
      { userAgent: "*", disallow: "/api/" },
      { userAgent: "*", disallow: "/parent/" },
    ],
  },
};