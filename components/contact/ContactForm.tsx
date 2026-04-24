"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          typeof data.error === "string" ? data.error : "Something went wrong."
        );
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCompany("");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-8 lg:p-10 text-center">
        <p className="text-[15px] font-semibold text-cs-ink mb-2">Message sent</p>
        <p className="text-sm text-cs-ink3 leading-relaxed mb-6">
          Thanks — we&apos;ll get back to you at the email you provided as soon as
          we can.
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

        {errorMsg && (
          <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 text-[15px] font-bold px-8 py-3.5 rounded-cs border-none bg-cs-green text-white transition hover:bg-cs-green-d hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(0,201,141,.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
