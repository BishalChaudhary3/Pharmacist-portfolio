"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "./image-field";
import { createCertification, updateCertification } from "@/lib/actions/certifications";
import { useToast } from "@/hooks/use-toast";

type MediaRecord = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  altText: string | null;
  caption: string | null;
  size: number;
};

interface CertificationFormProps {
  certification?: {
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate: Date | null;
    credentialId: string | null;
    credentialUrl: string | null;
    description: string | null;
    enabled: boolean;
    certificateMediaId: string | null;
    certificateMedia: MediaRecord | null;
  };
}

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function CertificationForm({ certification }: CertificationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [certMediaId, setCertMediaId] = useState<string | null>(
    certification?.certificateMediaId ?? null
  );

  const handleSubmit = (formData: FormData) => {
    const issueRaw = formData.get("issueDate") as string;
    const expiryRaw = formData.get("expiryDate") as string;
    formData.set("issueDate", new Date(issueRaw).toISOString());
    if (expiryRaw) formData.set("expiryDate", new Date(expiryRaw).toISOString());
    formData.set("enabled", formData.get("enabled") === "on" ? "true" : "false");
    formData.set("displayOrder", "0");
    formData.set("certificateMediaId", certMediaId ?? "");

    startTransition(async () => {
      const result = certification
        ? await updateCertification(certification.id, formData)
        : await createCertification(formData);

      if ("errors" in result && result.errors) {
        toast({ variant: "destructive", title: "Please fix the errors" });
        return;
      }
      toast({ variant: "success", title: certification ? "Saved" : "Created" });
      router.push("/admin/certifications");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Certification name</Label>
          <Input id="name" name="name" required defaultValue={certification?.name ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuingOrganization">Issuing organization</Label>
          <Input
            id="issuingOrganization"
            name="issuingOrganization"
            required
            defaultValue={certification?.issuingOrganization ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              name="issueDate"
              type="date"
              required
              defaultValue={toDateInput(certification?.issueDate)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry date (optional)</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              defaultValue={toDateInput(certification?.expiryDate)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credentialId">Credential ID (optional)</Label>
          <Input
            id="credentialId"
            name="credentialId"
            defaultValue={certification?.credentialId ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credentialUrl">Credential verification URL (optional)</Label>
          <Input
            id="credentialUrl"
            name="credentialUrl"
            type="url"
            defaultValue={certification?.credentialUrl ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={certification?.description ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Certificate file (PDF, optional)</Label>
          <ImageField
            value={certMediaId}
            initialMedia={certification?.certificateMedia ?? null}
            onChange={(id) => setCertMediaId(id)}
            filter="pdf"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="enabled"
            name="enabled"
            defaultChecked={certification?.enabled ?? true}
          />
          <Label htmlFor="enabled">Show on website</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : certification ? (
            "Save Changes"
          ) : (
            "Create Certification"
          )}
        </Button>
      </div>
    </form>
  );
}