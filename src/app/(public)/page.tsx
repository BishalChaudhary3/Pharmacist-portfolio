import { Hero } from "@/components/public/hero";
import { AboutPreview } from "@/components/public/about-preview";
import { Expertise } from "@/components/public/expertise";
import { FeaturedArticles } from "@/components/public/featured-articles";
import { ExperiencePreview } from "@/components/public/experience-preview";
import { CTA } from "@/components/public/cta";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export const revalidate = 60; // revalidate every 60 seconds

export default async function HomePage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "EDITOR";

  // Fetch page sections for homepage
  const homepage = await db.page.findUnique({
    where: { slug: "homepage" },
    include: {
      sections: {
        where: { enabled: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const sections = homepage?.sections ?? [];

  // Fetch featured articles
  const featuredArticles = await db.article.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { featuredOrder: "asc" },
    take: 5,
    include: {
      coverImage: true,
      category: true,
      author: true,
    },
  });

  // Fetch experience preview
  const experiences = await db.experience.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
    take: 5,
  });

  // Fetch expertise
  const expertiseItems = await db.expertise.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
  });

  const renderSection = (section: (typeof sections)[number]) => {
  switch (section.type) {
    case "HERO":
      return <Hero key={section.id} content={asRecord(section.content)} />;
    case "ABOUT_PREVIEW":
      return <AboutPreview key={section.id} content={asRecord(section.content)} />;
    case "EXPERTISE":
      return (
        <Expertise
          key={section.id}
          items={expertiseItems}
          content={asRecord(section.content)}
        />
      );
    case "FEATURED_ARTICLES":
      return (
        <FeaturedArticles
          key={section.id}
          articles={featuredArticles}
          content={asRecord(section.content)}
        />
      );
    case "EXPERIENCE_PREVIEW":
      return (
        <ExperiencePreview
          key={section.id}
          experiences={experiences}
          content={asRecord(section.content)}
        />
      );
    case "CTA":
      return <CTA key={section.id} content={asRecord(section.content)} />;
    default:
      return null;
  }
};

  return (
    <>
      {sections.map(renderSection)}
    </>
  );
}