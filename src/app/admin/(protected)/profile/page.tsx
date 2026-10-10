import { db } from "@/lib/db";
import { ProfileForm } from "@/components/admin/profile-form";

export default async function ProfilePage() {
  const profile = await db.profile.findFirst({
    include: { profilePhoto: true, cvMedia: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your name, bio, photo, CV, and contact details.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}