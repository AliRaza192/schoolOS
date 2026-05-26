import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "SchoolOS <onboarding@resend.dev>";
const ADMIN_EMAIL = "aliraza.work24@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BRAND_COLOR = "#2563EB";

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SchoolOS Pakistan</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:${BRAND_COLOR};padding:24px 32px;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">
                    🏫 SchoolOS Pakistan
                  </h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:32px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                    SchoolOS Pakistan | Pakistan ka sabse aasaan school management system<br>
                    Support: support@schoolos.pk | 
                    <a href="${APP_URL}" style="color:${BRAND_COLOR};">schoolos.pk</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// 1. Welcome Email
export async function sendWelcomeEmail(
  to: string,
  schoolName: string,
  trialDays: number = 14
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "SchoolOS mein khush amdeed! 🎉",
      html: baseTemplate(`
        <h2 style="color:#111827;margin:0 0 16px;">
          Khush Amdeed, ${schoolName}! 🎉
        </h2>
        <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">
          Aapka SchoolOS Pakistan mein account ban gaya hai. 
          Aap ab Pakistan ke best school management system 
          ka hissa hain!
        </p>
        
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="margin:0;color:#1d4ed8;font-weight:bold;">
            🎁 Free Trial: ${trialDays} Din
          </p>
          <p style="margin:8px 0 0;color:#3b82f6;font-size:14px;">
            Agle ${trialDays} din tak sab features free mein use karein.
            Koi credit card nahi chahiye.
          </p>
        </div>

        <p style="color:#4b5563;line-height:1.6;margin:0 0 8px;">
          <strong>Kya kar sakte hain:</strong>
        </p>
        <ul style="color:#4b5563;line-height:2;margin:0 0 24px;padding-left:20px;">
          <li>✅ Students enroll karein</li>
          <li>✅ Daily attendance mark karein</li>
          <li>✅ Fees manage karein</li>
          <li>✅ Reports dekhein</li>
        </ul>

        <a href="${APP_URL}/dashboard" 
           style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
          Dashboard Kholein →
        </a>

        <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
          Koi masla ho to email karein: support@schoolos.pk
        </p>
      `),
    });
  } catch (error) {
    console.error("[EMAIL_WELCOME]", error);
  }
}

// 2. Subscription Request Email (to admin)
export async function sendSubscriptionRequestEmail(
  schoolName: string,
  plan: string,
  amount: number,
  paymentMethod: string,
  transactionId: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New Subscription Request - ${schoolName}`,
      html: baseTemplate(`
        <h2 style="color:#111827;margin:0 0 16px;">
          💰 New Subscription Request
        </h2>
        
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">School</td>
              <td style="padding:6px 0;font-weight:bold;color:#111827;">${schoolName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">Plan</td>
              <td style="padding:6px 0;font-weight:bold;color:#111827;text-transform:capitalize;">${plan}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">Amount</td>
              <td style="padding:6px 0;font-weight:bold;color:#16a34a;">Rs. ${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">Payment Method</td>
              <td style="padding:6px 0;font-weight:bold;color:#111827;text-transform:capitalize;">${paymentMethod.replace("_", " ")}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#6b7280;font-size:14px;">Transaction ID</td>
              <td style="padding:6px 0;font-family:monospace;background:#f3f4f6;padding:4px 8px;border-radius:4px;color:#111827;">${transactionId}</td>
            </tr>
          </table>
        </div>

        <a href="${APP_URL}/dashboard/settings/billing/admin"
           style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Admin Panel Mein Dekho →
        </a>

        <p style="color:#9ca3af;font-size:13px;margin:16px 0 0;">
          Yeh request verify kar ke confirm ya reject karein.
        </p>
      `),
    });
  } catch (error) {
    console.error("[EMAIL_SUBSCRIPTION_REQUEST]", error);
  }
}

// 3. Subscription Confirmed Email
export async function sendSubscriptionConfirmedEmail(
  to: string,
  schoolName: string,
  plan: string,
  expiryDate: Date
): Promise<void> {
  const planFeatures: Record<string, string[]> = {
    basic: [
      "200 students tak enrollment",
      "Daily attendance tracking",
      "Fee management",
      "Basic reports",
    ],
    pro: [
      "Unlimited students",
      "AI Report Cards (Gemini)",
      "Parent Portal",
      "WhatsApp alerts",
      "5 staff users",
    ],
    academy: [
      "Sab Pro features",
      "Multi-branch support",
      "Custom branding",
      "API access",
      "Priority support",
    ],
  };

  const features = planFeatures[plan] ?? planFeatures.basic;
  const featuresHtml = features
    .map((f) => `<li style="color:#4b5563;line-height:2;">✅ ${f}</li>`)
    .join("");

  const expiry = expiryDate.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Subscription Activate Ho Gayi! ✓",
      html: baseTemplate(`
        <h2 style="color:#111827;margin:0 0 8px;">
          Mubarak Ho, ${schoolName}! 🎉
        </h2>
        <p style="color:#4b5563;margin:0 0 24px;">
          Aapki subscription successfully activate ho gayi hai.
        </p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="margin:0;color:#16a34a;font-weight:bold;font-size:18px;text-transform:capitalize;">
            ✓ ${plan} Plan Active
          </p>
          <p style="margin:8px 0 0;color:#15803d;font-size:14px;">
            Valid until: <strong>${expiry}</strong>
          </p>
        </div>

        <p style="color:#374151;font-weight:bold;margin:0 0 8px;">
          Is plan mein shamil features:
        </p>
        <ul style="margin:0 0 24px;padding-left:20px;">
          ${featuresHtml}
        </ul>

        <a href="${APP_URL}/dashboard"
           style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Dashboard Kholein →
        </a>

        <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
          Shukriya SchoolOS choose karne ka! 
          Koi sawaal ho to: support@schoolos.pk
        </p>
      `),
    });
  } catch (error) {
    console.error("[EMAIL_SUBSCRIPTION_CONFIRMED]", error);
  }
}

// 4. Trial Expiry Reminder Email
export async function sendTrialExpiryReminderEmail(
  to: string,
  schoolName: string,
  daysLeft: number
): Promise<void> {
  const urgency = daysLeft <= 3 ? "🚨" : "⚠️";
  const color = daysLeft <= 3 ? "#dc2626" : "#d97706";
  const bgColor = daysLeft <= 3 ? "#fef2f2" : "#fffbeb";
  const borderColor = daysLeft <= 3 ? "#fecaca" : "#fde68a";

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Trial mein sirf ${daysLeft} din bache hain ${urgency}`,
      html: baseTemplate(`
        <h2 style="color:#111827;margin:0 0 16px;">
          ${urgency} Trial Khatam Hone Wala Hai
        </h2>

        <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="margin:0;color:${color};font-weight:bold;font-size:20px;">
            Sirf ${daysLeft} din bache hain!
          </p>
          <p style="margin:8px 0 0;color:${color};font-size:14px;">
            ${schoolName} ka free trial ${daysLeft} din mein khatam ho jayega.
          </p>
        </div>

        <p style="color:#4b5563;line-height:1.6;margin:0 0 16px;">
          Trial khatam hone ke baad aap dashboard access nahi kar 
          sakenge. Abhi upgrade karein aur uninterrupted service 
          enjoy karein.
        </p>

        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="margin:0 0 12px;font-weight:bold;color:#111827;">
            Plans aur Prices:
          </p>
          <p style="margin:0 0 8px;color:#4b5563;">
            📦 Basic — Rs. 1,500/month (200 students)
          </p>
          <p style="margin:0 0 8px;color:#4b5563;">
            ⭐ Pro — Rs. 3,000/month (Unlimited + AI Reports)
          </p>
          <p style="margin:0;color:#4b5563;">
            🏫 Academy — Rs. 5,000/month (Multi-branch)
          </p>
        </div>

        <a href="${APP_URL}/dashboard/settings/billing"
           style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
          Abhi Upgrade Karein →
        </a>

        <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;">
          Payment kar ke transaction ID bhejein — 
          1-24 hours mein activate ho jayegi.
        </p>
      `),
    });
  } catch (error) {
    console.error("[EMAIL_TRIAL_EXPIRY]", error);
  }
}