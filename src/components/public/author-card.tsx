import { db } from "@/lib/db";

export async function AuthorCard() {
  const profile = await db.profile.findFirst({
    include: { profilePhoto: true },
  });

  if (!profile) return null;

  return (
    <div className="flex items-start gap-4">
      {profile.profilePhoto && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-secondary/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.profilePhoto.url}
            alt={profile.profilePhoto.altText || profile.fullName}
            className="h-full w-full object-cover object-top"
          />
        </div>
      )}
      <div className="pt-1">
        <p className="text-sm font-medium text-text-primary">
          {profile.fullName}
        </p>
        <p className="text-xs text-text-muted">{profile.professionalTitle}</p>
      </div>
    </div>
  );
}