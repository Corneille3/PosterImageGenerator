import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Kornea Poster AI.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-text">Privacy Policy</h1>
        <p className="mt-3 text-muted">
          This Privacy Policy explains what information we collect and how we
          use it when you use Kornea Poster AI.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">Information We Collect</h2>
          <p className="mt-2 text-muted">
            We collect basic account information such as your email address and
            unique identifier used for authentication.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">Why We Collect It</h2>
          <p className="mt-2 text-muted">
            We use this information to authenticate your account, secure access
            to the application, and provide the service.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">Contact</h2>
          <p className="mt-2 text-muted">
            If you have questions about this policy, contact us at{" "}
            <a
              className="text-text underline decoration-border underline-offset-4 hover:text-accent transition-colors"
              href="mailto:josycorneille3@gmail.com"
            >
              josycorneille3@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
