import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  inquiryType: z.enum(["general", "speaking", "writing", "collaboration"]).optional(),
});

export const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  coverImageId: z.string().optional(),
  ogImageId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "SCHEDULED"]),
  scheduledAt: z.iso.datetime().optional(),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().int().default(0),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  canonicalUrl: z.url().optional().or(z.literal("")),
});

export const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  location: z.string().optional(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  displayOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime().optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

export const certificationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  issuingOrganization: z.string().min(1, "Issuing organization is required"),
  issueDate: z.iso.datetime(),
  expiryDate: z.iso.datetime().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.url().optional().or(z.literal("")),
  description: z.string().optional(),
  displayOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

export const expertiseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().optional(),
  iconIdentifier: z.string().default("pill"),
  displayOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

export const navigationItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
  isExternal: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  enabled: z.boolean().default(true),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.url().optional().or(z.literal("")),
  instagram: z.url().optional().or(z.literal("")),
  researchGate: z.url().optional().or(z.literal("")),
  orcid: z.url().optional().or(z.literal("")),
  copyright: z.string().optional(),
  medicalDisclaimer: z.string().optional(),
  defaultSeoTitle: z.string().optional(),
  defaultSeoDescription: z.string().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  professionalTitle: z.string().min(1, "Professional title is required"),
  shortBio: z.string().max(300).optional(),
  longBio: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.url().optional().or(z.literal("")),
  instagramUrl: z.url().optional().or(z.literal("")),
  researchGateUrl: z.url().optional().or(z.literal("")),
  orcidUrl: z.url().optional().or(z.literal("")),
});

export const mediaSchema = z.object({
  filename: z.string(),
  altText: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
});