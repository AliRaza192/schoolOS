import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  schoolName: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = contactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.issues },
        { status: 422 }
      );
    }

    const { name, phone, schoolName, message } = validated.data;

    await resend.emails.send({
      from: "SchoolOS Contact <onboarding@resend.dev>",
      to: "aliraza.work24@gmail.com",
      subject: `New Contact: ${name}${schoolName ? ` (${schoolName})` : ""}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#2563EB;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h1 style="color:white;margin:0;font-size:18px;">SchoolOS - New Contact Message</h1>
          </div>
          <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;">Name</td>
                <td style="padding:8px 0;font-weight:bold;color:#111827;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px;">Phone</td>
                <td style="padding:8px 0;font-weight:bold;color:#111827;">${phone}</td>
              </tr>
              ${
                schoolName
                  ? `<tr>
                      <td style="padding:8px 0;color:#6b7280;font-size:14px;">School</td>
                      <td style="padding:8px 0;font-weight:bold;color:#111827;">${schoolName}</td>
                    </tr>`
                  : ""
              }
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Message</td>
                <td style="padding:8px 0;color:#374151;line-height:1.6;">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center;">
            Sent from SchoolOS Pakistan contact form
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTACT_POST]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
