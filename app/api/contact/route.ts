import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email/sendContactEmail";

export const runtime = "nodejs";

const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Please enter at least 10 characters")
    .max(10000),
  /** Honeypot — bots fill this; humans never see it */
  company: z.string().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const first =
      Object.values(fieldErrors).flat()[0] ?? "Validation failed";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const { name, email, subject, message, company } = parsed.data;

  if (company && company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendContactEmail({ name, email, subject, message });

  if (!result.ok && result.reason === "not_configured") {
    console.error(
      "[contact] SMTP not configured. Set SMTP_PASS (Hostinger) in your environment."
    );
    return NextResponse.json(
      { error: "Email service is not configured. Please try again later." },
      { status: 503 }
    );
  }

  if (!result.ok) {
    console.error("[contact] send failed:", result.detail);
    return NextResponse.json(
      { error: "Could not send your message. Please try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
