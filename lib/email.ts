import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "PathWise <onboarding@resend.dev>";

function getEmailHtml(code: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">PathWise</h1>
                  <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Verify your email address</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                    Enter the following code to verify your email and complete your registration:
                  </p>
                  <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                    <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e293b;font-family:'Courier New',monospace;">
                      ${code}
                    </span>
                  </div>
                  <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.5;">
                    This code expires in <strong>10 minutes</strong>.
                  </p>
                  <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:0 40px 32px;text-align:center;">
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    &copy; ${new Date().getFullYear()} PathWise. All rights reserved.
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

export async function sendVerificationCode(email: string, code: string) {
  // Always log to console so devs can grab the code from the terminal
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║       📧  VERIFICATION CODE                      ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Email : ${email.padEnd(39)}║`);
  console.log(`║  Code  : ${code.padEnd(39)}║`);
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\n");

  // If no Resend key, we're done (dev-only mode)
  if (!resend) {
    return { success: true, data: { id: "dev-mode" } };
  }

  // Try sending a real email via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "PathWise — Your Verification Code",
      html: getEmailHtml(code),
    });

    if (error) {
      console.error("[EMAIL_ERROR]", error);
      // Email failed but code is still in DB — user can grab it from terminal
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent successfully to ${email}`);
    return { success: true, data };
  } catch (err) {
    console.error("[EMAIL_ERROR]", err);
    return { success: false, error: "Failed to send email" };
  }
}

export function generateOTP(): string {
  // Cryptographically random 6-digit code
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}
