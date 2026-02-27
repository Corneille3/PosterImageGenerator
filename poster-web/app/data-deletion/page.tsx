import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion",
  description: "Request deletion of your Kornea Poster AI data.",
  alternates: { canonical: "/data-deletion" },
};

export default function DataDeletionPage() {
  return (
    <div className="py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-text">Data Deletion</h1>
        <p className="mt-3 text-muted">
          To delete your data, email{" "}
          <a
            className="text-text underline decoration-border underline-offset-4 hover:text-accent transition-colors"
            href="mailto:josycorneille3@gmail.com"
          >
            josycorneille3@gmail.com
          </a>{" "}
          with your account email and the subject “Delete my data”.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">What We Delete</h2>
          <p className="mt-2 text-muted">
            We delete your account data, generation history, and stored images
            associated with your account.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">Timeline</h2>
          <p className="mt-2 text-muted">
            We process deletion requests within 7 days.
          </p>
        </section>
      </div>
    </div>
  );
}
