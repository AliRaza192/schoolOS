import { auth } from "@clerk/nextjs/server";
import { getSchoolId } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { fees, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { markPaidSchema } from "@/lib/validations/fee";


function generateReceiptNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SCH-${year}-${random}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    const fee = await db.query.fees.findFirst({
      where: and(eq(fees.id, id), eq(fees.schoolId, schoolId)),
      with: { student: { with: { class: true } } },
    });

    if (!fee) return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    return NextResponse.json({ fee });
  } catch (error) {
    console.error("[FEE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;
    const body = await req.json();
    const validated = markPaidSchema.safeParse({ id, ...body });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const existing = await db.query.fees.findFirst({
      where: and(eq(fees.id, id), eq(fees.schoolId, schoolId)),
    });

    if (!existing) return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    const { paidAmount, paymentDate, receiptNo } = validated.data;
    const totalAmount = Number(existing.amount);

    let status: "paid" | "partial" = "partial";
    if (paidAmount >= totalAmount) status = "paid";

    const [updated] = await db
      .update(fees)
      .set({
        paidAmount: String(paidAmount),
        status,
        paidAt: new Date(paymentDate),
        receiptNo: receiptNo || existing.receiptNo || generateReceiptNo(),
      })
      .where(and(eq(fees.id, id), eq(fees.schoolId, schoolId)))
      .returning();

    return NextResponse.json({ fee: updated });
  } catch (error) {
    console.error("[FEE_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const schoolId = await getSchoolId(userId);
    if (!schoolId) return NextResponse.json({ error: "School not found" }, { status: 404 });

    const { id } = await params;

    const existing = await db.query.fees.findFirst({
      where: and(eq(fees.id, id), eq(fees.schoolId, schoolId)),
    });

    if (!existing) return NextResponse.json({ error: "Fee not found" }, { status: 404 });

    if (existing.status === "paid") {
      return NextResponse.json(
        { error: "Paid fees delete nahi ho sakti" },
        { status: 400 }
      );
    }

    await db.delete(fees).where(and(eq(fees.id, id), eq(fees.schoolId, schoolId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FEE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}