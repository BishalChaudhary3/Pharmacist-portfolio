import { PrismaClient } from "../src/generated/prisma/client";
import { PageSectionType } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { Prisma } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database…");

  // Site settings
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "[PHARMACIST_NAME]",
      siteDescription:
        "Pharmacist & Healthcare Writer — evidence-based perspectives on medicines, pharmacy, and healthcare.",
      medicalDisclaimer:
        "The information on this website is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
      copyright: `© ${new Date().getFullYear()} [PHARMACIST_NAME]. All rights reserved.`,
    },
  });

  // Profile
  await db.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      fullName: "[PHARMACIST_NAME]",
      professionalTitle: "Pharmacist & Healthcare Writer",
      shortBio:
        "[PROFESSIONAL_BIO — a short, placeholder biography to be replaced with real content.]",
    },
  });

  // Homepage sections
  const homepage = await db.page.upsert({
    where: { slug: "homepage" },
    update: {},
    create: { slug: "homepage", title: "Homepage" },
  });

  const sections: {
    type: PageSectionType;
    order: number;
    content: Prisma.InputJsonValue;
  }[] = [
    { type: PageSectionType.HERO, order: 1, content: {} },
    { type: PageSectionType.ABOUT_PREVIEW, order: 2, content: {} },
    { type: PageSectionType.EXPERTISE, order: 3, content: {} },
    { type: PageSectionType.FEATURED_ARTICLES, order: 4, content: {} },
    { type: PageSectionType.EXPERIENCE_PREVIEW, order: 5, content: {} },
    { type: PageSectionType.CTA, order: 6, content: {} },
  ];

  for (const s of sections) {
    await db.pageSection.upsert({
      where: { pageId_type: { pageId: homepage.id, type: s.type } },
      update: {},
      create: {
        pageId: homepage.id,
        type: s.type,
        displayOrder: s.order,
        content: s.content,
      },
    });
  }

  // Navigation
  const navItems = [
    { label: "About", url: "/about", displayOrder: 1 },
    { label: "Experience", url: "/experience", displayOrder: 2 },
    { label: "Articles", url: "/articles", displayOrder: 3 },
    { label: "Contact", url: "/contact", displayOrder: 4 },
    { label: "CV", url: "/cv", displayOrder: 5 },
  ];
  for (const item of navItems) {
    const existing = await db.navigationItem.findFirst({
      where: { label: item.label },
    });
    if (!existing) {
      await db.navigationItem.create({ data: { ...item, enabled: true } });
    }
  }

  // Categories
  const categories = [
    "Pharmacy",
    "Medicines",
    "Patient Education",
    "Health & Wellness",
    "Research",
    "Professional Development",
  ];
  for (const [i, name] of categories.entries()) {
    const slug = name.toLowerCase().replace(/[^\w]+/g, "-");
    await db.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, displayOrder: i },
    });
  }

  // Expertise
  const expertiseItems = [
    { title: "Pharmacology", shortDescription: "[PLACEHOLDER_DESCRIPTION]", iconIdentifier: "pill" },
    { title: "Medication Safety", shortDescription: "[PLACEHOLDER_DESCRIPTION]", iconIdentifier: "shield" },
    { title: "Patient Education", shortDescription: "[PLACEHOLDER_DESCRIPTION]", iconIdentifier: "users" },
    { title: "Healthcare Communication", shortDescription: "[PLACEHOLDER_DESCRIPTION]", iconIdentifier: "message" },
    { title: "Clinical Pharmacy", shortDescription: "[PLACEHOLDER_DESCRIPTION]", iconIdentifier: "activity" },
    { title: "Research", shortDescription: "[PLACEHOLDER_DESCRIPTION]", iconIdentifier: "flask" },
  ];
  for (const [i, item] of expertiseItems.entries()) {
    const existing = await db.expertise.findFirst({ where: { title: item.title } });
    if (!existing) {
      await db.expertise.create({ data: { ...item, displayOrder: i, enabled: true } });
    }
  }

  console.log("Seed complete.");
  console.log(
    "Placeholders in this seed data MUST be replaced with real content before production deployment."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());