import { db } from "@/lib/db";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default async function SeoPage() {
  const settings = await db.siteSettings.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">SEO</h2>
        <p className="mt-1 text-sm text-slate-500">
          Default metadata used across the site. Individual articles can override
          these values in the article editor.
        </p>
      </div>
      <SiteSettingsForm settings={settings} variant="seo" />
    </div>
  );
}