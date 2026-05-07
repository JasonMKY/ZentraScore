"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "support@zentrascore.com";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (company.trim().length > 0) {
      setStatus("success");
      return;
    }

    const fullSubject = `[Contact] ${subject}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?${new URLSearchParams({
      subject: fullSubject,
      body,
    }).toString()}`;

    window.location.href = mailtoUrl;

    setStatus("success");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setCompany("");
  }

  if (status === "success") {
    return (
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-8 lg:p-10 text-center">
        <p className="text-[15px] font-semibold text-cs-ink mb-2">
          Opening your email app…
        </p>
        <p className="text-sm text-cs-ink3 leading-relaxed mb-6">
          Your message to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-cs-green-d hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          has been prepared. Please review and hit send in your email client.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm font-bold text-cs-green-d hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-8 lg:p-10 shadow-cs-sm"
    >
      <p className="text-[13px] text-cs-ink3 mb-8">
        Questions about your score, billing, or the API? Fill out the form
        below. Messages are delivered to{" "}
        <a
          href="mailto:support@zentrascore.com"
          className="font-semibold text-cs-green-d hover:underline"
        >
          support@zentrascore.com
        </a>
        .
      </p>

      <div className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-1.5 font-mono"
          >
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-[1.5px] border-cs-border rounded-cs px-4 py-3 text-sm text-cs-ink bg-white outline-none focus:border-cs-green"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-1.5 font-mono"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-[1.5px] border-cs-border rounded-cs px-4 py-3 text-sm text-cs-ink bg-white outline-none focus:border-cs-green"
          />
        </div>
        <div>
          <label
            htmlFor="contact-subject"
            className="block text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-1.5 font-mono"
          >
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border-[1.5px] border-cs-border rounded-cs px-4 py-3 text-sm text-cs-ink bg-white outline-none focus:border-cs-green"
          />
        </div>
        <div>
          <label
            htmlFor="contact-message"
            className="block text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-1.5 font-mono"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border-[1.5px] border-cs-border rounded-cs px-4 py-3 text-sm text-cs-ink bg-white outline-none focus:border-cs-green resize-y min-h-[140px]"
          />
        </div>

        {/* Honeypot — hidden from users */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="contact-company">Company</label>
          <input
            id="contact-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="mt-2 text-[15px] font-bold px-8 py-3.5 rounded-cs border-none bg-cs-green text-white transition hover:bg-cs-green-d hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(0,201,141,.35)]"
        >
          Send message
        </button>
      </div>
    </form>
  );
}
