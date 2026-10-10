import { db } from "@/lib/db";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default async function SettingsPage() {
  const settings = await db.siteSettings.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Site Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Global site information, contact details, social links, and legal text.
        </p>
      </div>
      <SiteSettingsForm settings={settings} variant="all" />
    </div>
  );
}