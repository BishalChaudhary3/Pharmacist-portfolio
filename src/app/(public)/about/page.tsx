import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SocialLinks } from "@/components/public/social-links";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Mahima Chaudhary — pharmacist and healthcare writer.",
};

export default async function AboutPage() {
  const profile = await db.profile.findFirst({
    include: { profilePhoto: true },
  });

  if (!profile) {
    return (
      <div className="container-prose section-padding">
        <p className="text-text-muted">Profile not yet configured.</p>
      </div>
    );
  }

  return (
    <div className="container-prose section-padding">
      <p className="eyebrow">About</p>
      <h1 className="mt-4 text-display-sm font-serif text-balance">
        {profile.fullName}
      </h1>
      <p className="mt-3 text-body-lg text-primary">{profile.professionalTitle}</p>

      {profile.profilePhoto && (
        <div className="relative mx-auto mt-12 max-w-[200px] sm:max-w-[260px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.profilePhoto.url}
            alt={profile.profilePhoto.altText || profile.fullName}
            className="h-auto w-full object-contain"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 55%, transparent 98%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 55%, transparent 98%)",
            }}
          />
        </div>
      )}

      {profile.longBio ? (
        <div
          className="prose-editorial mt-12"
          dangerouslySetInnerHTML={{ __html: profile.longBio }}
        />
      ) : profile.shortBio ? (
        <p className="mt-12 text-body-lg">{profile.shortBio}</p>
      ) : null}

      <div className="mt-16 border-t border-border pt-8">
        <SocialLinks
          linkedin={profile.linkedinUrl}
          instagram={profile.instagramUrl}
          researchGate={profile.researchGateUrl}
          orcid={profile.orcidUrl}
          email={profile.email}
          phone={profile.phone}
        />
      </div>
    </div>
  );
}