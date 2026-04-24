import nodemailer from "nodemailer";

const SUPPORT_EMAIL =
  process.env.CONTACT_SUPPORT_EMAIL?.trim() || "support@zentrascore.com";

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

/** Attempt Resend REST API (no extra runtime deps beyond fetch). */
async function sendViaResend(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; detail: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, detail: "no_resend_key" };

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "ZentraScore <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [SUPPORT_EMAIL],
      reply_to: [params.email],
      subject: `[Contact] ${params.subject}`,
      html: buildHtml(params),
      text: buildText(params),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      detail: body.slice(0, 500) || `HTTP ${res.status}`,
    };
  }
  return { ok: true };
}

async function sendViaSmtp(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; detail: string }> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return { ok: false, detail: "no_smtp" };

  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      user && pass
        ? {
            user,
            pass,
          }
        : undefined,
  });

  const from =
    process.env.SMTP_FROM?.trim() ||
    (user ? `"ZentraScore" <${user}>` : SUPPORT_EMAIL);

  try {
    await transporter.sendMail({
      from,
      to: SUPPORT_EMAIL,
      replyTo: `"${params.name.replace(/"/g, "")}" <${params.email}>`,
      subject: `[Contact] ${params.subject}`,
      html: buildHtml(params),
      text: buildText(params),
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, detail: msg };
  }
}

/**
 * Sends the contact form to SUPPORT_EMAIL (default support@zentrascore.com).
 * Uses RESEND_API_KEY when set; otherwise SMTP_* when SMTP_HOST is set.
 */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<
  | { ok: true; via: "resend" | "smtp" }
  | { ok: false; reason: "not_configured" | "send_failed"; detail?: string }
> {
  if (process.env.RESEND_API_KEY?.trim()) {
    const r = await sendViaResend(params);
    if (r.ok) return { ok: true, via: "resend" };
    const smtpFallback = await sendViaSmtp(params);
    if (smtpFallback.ok) return { ok: true, via: "smtp" };
    return {
      ok: false,
      reason: "send_failed",
      detail: r.detail,
    };
  }

  const smtp = await sendViaSmtp(params);
  if (smtp.ok) return { ok: true, via: "smtp" };

  if (!process.env.SMTP_HOST?.trim()) {
    return { ok: false, reason: "not_configured" };
  }

  return {
    ok: false,
    reason: "send_failed",
    detail: smtp.detail,
  };
}
