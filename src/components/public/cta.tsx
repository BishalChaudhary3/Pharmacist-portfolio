import Link from "next/link";

interface CTAProps {
  content: Record<string, unknown>;
}

export function CTA({ content }: CTAProps) {
  const heading =
    (content.heading as string) ||
    "Explore evidence-based perspectives on medicines and healthcare.";
  const description =
    (content.description as string) ||
    "Read articles, learn about my work, or get in touch.";
  const buttonText = (content.buttonText as string) || "Read Articles";
  const buttonUrl = (content.buttonUrl as string) || "/articles";

  return (
    <section className="section-padding">
      <div className="container-content">
        <div className="rounded-lg border border-border bg-surface p-12 text-center md:p-16">
          <h2 className="text-display-sm font-serif text-balance">{heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-text-muted">{description}</p>
          <Link
            href={buttonUrl}
            className="mt-8 inline-flex h-12 items-center rounded-md bg-primary px-8 text-sm font-medium text-white hover:bg-primary/90"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}