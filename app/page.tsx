import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function HomePage() {
  const { userId } = await auth();

  // Not logged in → sign in page
  if (!userId) {
    redirect("/sign-in");
  }

  // Check onboarding status
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  // Not onboarded → onboarding
  if (!user?.schoolId) {
    redirect("/onboarding");
  }

  // Onboarded → dashboard
  redirect("/dashboard");
}