"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageField } from "./image-field";
import { RichTextEditor } from "./rich-text-editor";
import { updateProfile } from "@/lib/actions/profile";
import { useToast } from "@/hooks/use-toast";
import type { MediaRecord } from "@/lib/types/media";

interface ProfileFormProps {
  profile: {
    id: string;
    fullName: string;
    professionalTitle: string;
    shortBio: string | null;
    longBio: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedinUrl: string | null;
    instagramUrl: string | null;
    researchGateUrl: string | null;
    orcidUrl: string | null;
    profilePhoto: MediaRecord | null;
    cvMedia: MediaRecord | null;
  } | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [photoId, setPhotoId] = useState<string | null>(profile?.profilePhoto?.id ?? null);
  const [cvId, setCvId] = useState<string | null>(profile?.cvMedia?.id ?? null);
  const [longBio, setLongBio] = useState(profile?.longBio ?? "");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (formData: FormData) => {
    formData.set("profilePhotoId", photoId ?? "");
    formData.set("cvMediaId", cvId ?? "");
    formData.set("longBio", longBio);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if ("errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        toast({ variant: "destructive", title: "Please fix the highlighted fields" });
        return;
      }
      toast({ variant: "success", title: "Profile updated" });
      setErrors({});
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-900">Basic information</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profile?.fullName ?? ""}
                required
              />
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="professionalTitle">Professional title</Label>
              <Input
                id="professionalTitle"
                name="professionalTitle"
                defaultValue={profile?.professionalTitle ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortBio">Short bio (shown on homepage)</Label>
              <Textarea
                id="shortBio"
                name="shortBio"
                defaultValue={profile?.shortBio ?? ""}
                maxLength={300}
                rows={3}
              />
              <p className="text-xs text-slate-500">Up to 300 characters.</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-900">Full biography</h3>
          <p className="mt-1 text-xs text-slate-500">
            Shown on the About page. Supports headings, lists, links, and images.
          </p>
          <div className="mt-4">
            <RichTextEditor
              content={longBio}
              onChange={setLongBio}
              placeholder="Write a professional biography…"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-900">Contact & links</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" name="location" defaultValue={profile?.location ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input id="instagramUrl" name="instagramUrl" type="url" defaultValue={profile?.instagramUrl ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="researchGateUrl">ResearchGate</Label>
              <Input id="researchGateUrl" name="researchGateUrl" type="url" defaultValue={profile?.researchGateUrl ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orcidUrl">ORCID</Label>
              <Input id="orcidUrl" name="orcidUrl" type="url" defaultValue={profile?.orcidUrl ?? ""} />
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-900">Profile photo</h3>
          <p className="mt-1 text-xs text-slate-500">
            Used on the homepage, About page, and beside your articles.
          </p>
          <div className="mt-4">
            <ImageField
              value={photoId}
              initialMedia={profile?.profilePhoto}
              onChange={(id) => setPhotoId(id)}
              filter="image"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-medium text-slate-900">CV (PDF)</h3>
          <p className="mt-1 text-xs text-slate-500">
            Visitors can view or download this from the CV link in the navigation.
          </p>
          <div className="mt-4">
            <ImageField
              value={cvId}
              initialMedia={profile?.cvMedia}
              onChange={(id) => setCvId(id)}
              filter="pdf"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </aside>
    </form>
  );
}