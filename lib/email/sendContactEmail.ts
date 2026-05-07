import nodemailer from "nodemailer";

const SUPPORT_EMAIL =
  process.env.CONTACT_SUPPORT_EMAIL?.trim() || "support@zentrascore.com";

const SMTP_HOST = process.env.SMTP_HOST?.trim() || "smtp.hostinger.com";
const SMTP_PORT = Number(process.env.SMTP_PORT?.trim() || "465");
const SMTP_SECURE =
  (process.env.SMTP_SECURE?.trim() || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER?.trim() || SUPPORT_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS?.trim() || "";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const nl = params.message.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const bodyHtml = escapeHtml(nl).replace(/\n/g, "<br />\n");
  return `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
<p><strong>Name:</strong> ${escapeHtml(params.name)}</p>
<p><strong>Email:</strong> <a href="mailto:${escapeHtml(params.email)}">${escapeHtml(params.email)}</a></p>
<p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
<p><strong>Message:</strong></p>
<p>${bodyHtml}</p>
</body></html>`;
}

function buildText(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return [
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Subject: ${params.subject}`,
    "",
    params.message,
  ].join("\n");
}

/**
 * Sends contact form mail through Hostinger SMTP (smtp.hostinger.com).
 * Required env: SMTP_PASS. Defaults assume Hostinger + support@zentrascore.com.
 * Optional overrides: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, CONTACT_SUPPORT_EMAIL.
 */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<
  | { ok: true }
  | { ok: false; reason: "not_configured" | "send_failed"; detail?: string }
> {
  if (!SMTP_PASS) {
    return { ok: false, reason: "not_configured" };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"ZentraScore Contact" <${SMTP_USER}>`,
      to: SUPPORT_EMAIL,
      replyTo: `"${params.name.replace(/"/g, "")}" <${params.email}>`,
      subject: `[Contact] ${params.subject}`,
      html: buildHtml(params),
      text: buildText(params),
    });
    return { ok: true };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "send_failed", detail };
  }
}
