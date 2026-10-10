# Pharmacist Professional Portfolio & Publishing Platform

A production-ready website and CMS for a professional pharmacist.

## Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Editor:** Tiptap
- **Email:** Resend
- **Validation:** Zod
- **Deployment:** Vercel

## Local Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the values
3. Install dependencies: `npm install`
4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed

   Setup note: In your Supabase project, go to Storage → New bucket, name it media, and mark it Public. This is required before any uploads will work.

