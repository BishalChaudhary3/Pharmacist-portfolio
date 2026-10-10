"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createEducation, updateEducation } from "@/lib/actions/education";
import { useToast } from "@/hooks/use-toast";

interface EducationFormProps {
  education?: {
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    description: string | null;
    enabled: boolean;
  };
}

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function EducationForm({ education }: EducationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const startRaw = formData.get("startDate") as string;
    const endRaw = formData.get("endDate") as string;
    formData.set("startDate", new Date(startRaw).toISOString());
    if (endRaw) formData.set("endDate", new Date(endRaw).toISOString());
    formData.set("enabled", formData.get("enabled") === "on" ? "true" : "false");
    formData.set("displayOrder", "0");

    startTransition(async () => {
      const result = education
        ? await updateEducation(education.id, formData)
        : await createEducation(formData);

      if ("errors" in result && result.errors) {
        toast({ variant: "destructive", title: "Please fix the errors" });
        return;
      }
      toast({ variant: "success", title: education ? "Saved" : "Created" });
      router.push("/admin/education");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            name="institution"
            required
            defaultValue={education?.institution ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree">Degree</Label>
          <Input
            id="degree"
            name="degree"
            required
            defaultValue={education?.degree ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field">Field of study (optional)</Label>
          <Input id="field" name="field" defaultValue={education?.field ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" name="location" defaultValue={education?.location ?? ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={toDateInput(education?.startDate)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInput(education?.endDate)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={education?.description ?? ""}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="enabled" name="enabled" defaultChecked={education?.enabled ?? true} />
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
          ) : education ? (
            "Save Changes"
          ) : (
            "Create Entry"
          )}
        </Button>
      </div>
    </form>
  );
}