import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import LandingPage from "./(marketing)/page";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (user?.schoolId) {
      if (user.role === "parent") redirect("/parent");
      redirect("/dashboard");
    }

    redirect("/onboarding");
  }

  // Not logged in — show landing page
  return <LandingPage />;
}