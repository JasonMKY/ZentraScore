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

/** Contact form mail via Resend. Requires RESEND_API_KEY; optional RESEND_FROM_EMAIL, CONTACT_SUPPORT_EMAIL. */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<
  | { ok: true; via: "resend" }
  | { ok: false; reason: "not_configured" | "send_failed"; detail?: string }
> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, reason: "not_configured" };
  }

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
      reason: "send_failed",
      detail: body.slice(0, 500) || `HTTP ${res.status}`,
    };
  }

  return { ok: true, via: "resend" };
}
