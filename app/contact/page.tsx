import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — ZentraScore",
  description:
    "Get in touch with ZentraScore. Send a message to our team — we reply from support@zentrascore.com.",
};

export default function ContactPage() {
  return (
    <>
      <main className="pt-[68px] min-h-screen bg-cs-paper">
        <div className="max-w-[560px] mx-auto px-6 py-14 lg:py-20">
          <p className="text-[11px] font-bold tracking-[.1em] uppercase text-cs-green-d mb-3">
            Contact
          </p>
          <h1 className="text-[clamp(26px,3vw,34px)] font-extrabold text-cs-ink tracking-tight mb-3">
            Talk to us
          </h1>
          <p className="text-[15px] text-cs-ink3 leading-relaxed mb-10">
            Product questions, partnerships, or support — we read every message.
          </p>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
