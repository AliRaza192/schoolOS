import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, students, classes, notifications, parentStudents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendNotificationSchema } from "@/lib/validations/parent";
import { checkFeatureAccess } from "@/lib/subscription";

async function getAdminUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { school: true },
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await getAdminUser(userId);
    if (!admin?.schoolId || admin.role !== "school_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hasAccess = await checkFeatureAccess(admin.schoolId, "parent_portal");
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Notifications Pro plan mein available hain" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = sendNotificationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { title, message, targetType, classId, studentId, sendVia } =
      validated.data;

    const schoolName = admin.school?.name ?? "School";

    // Get target students
    let targetStudents: { id: string; name: string; phone: string | null }[] = [];

    if (targetType === "all") {
      const all = await db.query.students.findMany({
        where: and(
          eq(students.schoolId, admin.schoolId),
          eq(students.isActive, true)
        ),
      });
      targetStudents = all.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
      }));
    } else if (targetType === "class" && classId) {
      const classStudents = await db.query.students.findMany({
        where: and(
          eq(students.classId, classId),
          eq(students.schoolId, admin.schoolId),
          eq(students.isActive, true)
        ),
      });
      targetStudents = classStudents.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
      }));
    } else if (targetType === "student" && studentId) {
      const single = await db.query.students.findFirst({
        where: and(
          eq(students.id, studentId),
          eq(students.schoolId, admin.schoolId)
        ),
      });
      if (single) {
        targetStudents = [{ id: single.id, name: single.name, phone: single.phone }];
      }
    }

    // WhatsApp message template
    const waMessage = `${schoolName} se message:\n\n${title}\n\n${message}\n\n- SchoolOS Pakistan`;

    // Generate WhatsApp links
    const whatsappLinks = targetStudents
      .filter((s) => s.phone)
      .map((s) => {
        const phone = s.phone!.replace(/[-\s]/g, "");
        const intlPhone = phone.startsWith("0")
          ? `92${phone.slice(1)}`
          : phone;
        const link = `https://wa.me/${intlPhone}?text=${encodeURIComponent(waMessage)}`;
        return {
          studentName: s.name,
          parentPhone: s.phone,
          link,
          message: waMessage,
        };
      });

    // Save notification
    await db.insert(notifications).values({
      schoolId: admin.schoolId,
      studentId: targetType === "student" ? studentId || null : null,
      classId: targetType === "class" ? classId || null : null,
      title,
      message,
      type: "general",
      sentVia: sendVia,
      sentByUserId: admin.id,
    });

    return NextResponse.json({
      success: true,
      whatsappLinks,
      totalTargeted: targetStudents.length,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await getAdminUser(userId);
    if (!admin?.schoolId) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const history = await db.query.notifications.findMany({
      where: eq(notifications.schoolId, admin.schoolId),
      orderBy: desc(notifications.createdAt),
      limit: 10,
    });

    return NextResponse.json({ notifications: history });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}