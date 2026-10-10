import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CVPage() {
  const profile = await db.profile.findFirst({
    include: { cvMedia: true },
  });

  if (!profile?.cvMedia) {
    return (
      <div className="container-prose section-padding">
        <h1 className="text-display-sm font-serif">Curriculum Vitae</h1>
        <p className="mt-6 text-text-muted">No CV has been uploaded yet.</p>
      </div>
    );
  }

  redirect(profile.cvMedia.url);
}