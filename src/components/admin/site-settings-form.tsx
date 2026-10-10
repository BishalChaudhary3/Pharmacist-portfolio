"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  id: string;
  siteName: string;
  siteDescription: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  instagram: string | null;
  researchGate: string | null;
  orcid: string | null;
  copyright: string | null;
  medicalDisclaimer: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
}

export function SiteSettingsForm({
  settings,
  variant = "all",
}: {
  settings: Settings | null;
  variant?: "all" | "seo";
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateSiteSettings(formData);
      if ("errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        toast({ variant: "destructive", title: "Please fix the errors" });
        return;
      }
      toast({ variant: "success", title: "Settings saved" });
      setErrors({});
    });
  };

  return (
    <form action={handleSubmit} className="max-w-3xl space-y-8">
      {variant === "all" && (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-900">Site identity</h3>
            <div className="space-y-2">
              <Label htmlFor="siteName">Site name</Label>
              <Input
                id="siteName"
                name="siteName"
                required
                defaultValue={settings?.siteName ?? ""}
              />
              {errors.siteName && (
                <p className="text-xs text-red-600">{errors.siteName[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site description</Label>
              <Textarea
                id="siteDescription"
                name="siteDescription"
                rows={2}
                defaultValue={settings?.siteDescription ?? ""}
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-900">Contact information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings?.email ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" name="phone" defaultValue={settings?.phone ?? ""} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={settings?.location ?? ""}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-900">Social links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  defaultValue={settings?.linkedin ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  type="url"
                  defaultValue={settings?.instagram ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="researchGate">ResearchGate</Label>
                <Input
                  id="researchGate"
                  name="researchGate"
                  type="url"
                  defaultValue={settings?.researchGate ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orcid">ORCID</Label>
                <Input
                  id="orcid"
                  name="orcid"
                  type="url"
                  defaultValue={settings?.orcid ?? ""}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-900">Legal & disclaimer</h3>
            <div className="space-y-2">
              <Label htmlFor="copyright">Copyright text</Label>
              <Input
                id="copyright"
                name="copyright"
                defaultValue={settings?.copyright ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalDisclaimer">Medical disclaimer</Label>
              <Textarea
                id="medicalDisclaimer"
                name="medicalDisclaimer"
                rows={4}
                defaultValue={settings?.medicalDisclaimer ?? ""}
              />
              <p className="text-xs text-slate-500">
                Shown in the footer and on article pages. Communicates that this
                site is educational and not a substitute for professional advice.
              </p>
            </div>
          </section>
        </>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-900">
          Default SEO metadata
        </h3>
        <p className="text-xs text-slate-500">
          Used when a page or article doesn&apos;t specify its own.
        </p>
        <div className="space-y-2">
          <Label htmlFor="defaultSeoTitle">Default SEO title</Label>
          <Input
            id="defaultSeoTitle"
            name="defaultSeoTitle"
            maxLength={60}
            defaultValue={settings?.defaultSeoTitle ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultSeoDescription">Default meta description</Label>
          <Textarea
            id="defaultSeoDescription"
            name="defaultSeoDescription"
            rows={2}
            maxLength={160}
            defaultValue={settings?.defaultSeoDescription ?? ""}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}