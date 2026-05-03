import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your ZentraScore account.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: "/sign-in" },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-[68px] flex flex-col items-center justify-center bg-cs-paper px-4 py-10 sm:py-14 lg:py-16">
      <SignIn
        appearance={{
          variables: { colorPrimary: "#00c98d", borderRadius: "10px" },
          elements: {
            card: "shadow-cs-lg border border-cs-border",
            headerTitle: "text-cs-ink",
            headerSubtitle: "text-cs-ink3",
            formButtonPrimary:
              "bg-cs-green hover:bg-cs-green-d text-white font-semibold",
            footer: "hidden",
          },
        }}
      />
      <p className="mt-8 text-center text-sm text-cs-ink3">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-cs-green-d hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
