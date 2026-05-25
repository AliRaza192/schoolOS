import { NextResponse } from "next/server";
import { db } from "@/db";
import { schools, users } from "@/db/schema";
import { eq, and, between } from "drizzle-orm";
import { sendTrialExpiryReminderEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();

    // Find schools expiring in 3 or 7 days
    const threeDays = new Date(today);
    threeDays.setDate(today.getDate() + 3);

    const sevenDays = new Date(today);
    sevenDays.setDate(today.getDate() + 7);

    const eightDays = new Date(today);
    eightDays.setDate(today.getDate() + 8);

    // Schools expiring in next 7 days
    const expiringSchools = await db.query.schools.findMany({
      where: and(
        eq(schools.plan, "basic"),
        eq(schools.isActive, true),
        between(
          schools.planExpiresAt,
          today,
          eightDays
        )
      ),
    });

    let sent = 0;

    for (const school of expiringSchools) {
      if (!school.planExpiresAt) continue;

      const expiresAt = new Date(school.planExpiresAt);
      const daysLeft = Math.ceil(
        (expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only send on day 7 and day 3
      if (daysLeft !== 7 && daysLeft !== 3) continue;

      // Get school admin email
      const admin = await db.query.users.findFirst({
        where: and(
          eq(users.schoolId, school.id),
          eq(users.role, "school_admin")
        ),
      });

      if (!admin?.email) continue;

      await sendTrialExpiryReminderEmail(admin.email, school.name, daysLeft);
      sent++;
    }

    return NextResponse.json({
      success: true,
      sent,
      checked: expiringSchools.length,
    });
  } catch (error) {
    console.error("[CRON_TRIAL_REMINDER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}