import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch.",
};

export default async function ContactPage() {
  const settings = await db.siteSettings.findFirst();

  return (
    <div className="container-content section-padding">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-display-sm font-serif text-balance">
            Get in touch.
          </h1>
          <p className="mt-6 text-body-lg text-text-muted">
            Whether you have a question, want to discuss a collaboration, or just want
            to say hello, I&apos;d be glad to hear from you.
          </p>

          {settings?.email && (
            <div className="mt-12 space-y-4 text-sm">
              <div>
                <p className="eyebrow">Email</p>
                <a href={`mailto:${settings.email}`} className="mt-1 block text-primary link-underline">
                  {settings.email}
                </a>
              </div>
              {settings.location && (
                <div>
                  <p className="eyebrow">Location</p>
                  <p className="mt-1 text-text-muted">{settings.location}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}