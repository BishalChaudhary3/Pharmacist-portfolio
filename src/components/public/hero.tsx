interface HeroProps {
  content: Record<string, unknown>;
}

export function Hero({ content }: HeroProps) {
  const eyebrow =
    (content.eyebrow as string) || "PHARMACIST • HEALTHCARE WRITER";
  const heading =
    (content.heading as string) ||
    "Making medicine and healthcare easier to understand.";
  const description =
    (content.description as string) ||
    "Evidence-based perspectives on medicines, pharmacy, and healthcare.";
  const primaryButtonText =
    (content.primaryButtonText as string) || "Read My Articles";
  const primaryButtonUrl =
    (content.primaryButtonUrl as string) || "/articles";
  const secondaryButtonText =
    (content.secondaryButtonText as string) || "About Me";
  const secondaryButtonUrl =
    (content.secondaryButtonUrl as string) || "/about";

  const coverImage = content.coverImage as
    | { url?: string; altText?: string }
    | undefined;
  const imageUrl = (content.imageUrl as string) || coverImage?.url;
  const imageAlt = coverImage?.altText || "Profile photo";

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 text-display font-serif text-balance">
              {heading}
            </h1>
            <p className="mt-6 text-body-lg text-text-muted text-pretty">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={primaryButtonUrl}
                className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                {primaryButtonText}
              </a>
              <a
                href={secondaryButtonUrl}
                className="inline-flex h-12 items-center rounded-md border border-border bg-surface px-6 text-sm font-medium text-text-primary transition-colors hover:bg-background"
              >
                {secondaryButtonText}
              </a>
            </div>
          </div>

          <div className="relative isolate mx-auto w-full max-w-sm lg:max-w-md">
            {/* Soft radial glow behind the image */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-4 top-8 bottom-0 -z-20 rounded-full bg-secondary/40 blur-3xl"
            />

            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={imageAlt}
                className="relative z-10 h-auto w-full object-contain"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 55%, transparent 98%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 55%, transparent 98%)",
                }}
              />
            ) : (
              <div className="relative z-10 flex aspect-[4/5] items-center justify-center text-sm text-text-muted">
                [PROFILE_PHOTO]
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}