import Link from "next/link";
import { db } from "@/lib/db";

interface AboutPreviewProps {
  content: Record<string, unknown>;
}

export async function AboutPreview({ content }: AboutPreviewProps) {
  const profile = await db.profile.findFirst();

  const heading =
    (content.heading as string) || "A pharmacist dedicated to clarity and care";
  const description =
    (content.description as string) ||
    profile?.shortBio ||
    "[PROFESSIONAL_BIO]";
  const buttonText = (content.buttonText as string) || "Read More About Me";
  const buttonUrl = (content.buttonUrl as string) || "/about";

  return (
    <section className="section-padding bg-surface overflow-hidden">
      <div className="container-content">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow animate-in fade-in slide-in-from-bottom-4 duration-700">
            About
          </p>

          <h2 className="mt-4 text-display-sm font-serif text-balance animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            {heading}
          </h2>

          <p className="mt-6 text-body-lg text-text-muted text-pretty animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            {description}
          </p>

          <Link
            href={buttonUrl}
            className="mt-8 inline-flex items-center text-sm font-medium text-primary link-underline animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both"
          >
            {buttonText} →
          </Link>
        </div>
      </div>
    </section>
  );
}