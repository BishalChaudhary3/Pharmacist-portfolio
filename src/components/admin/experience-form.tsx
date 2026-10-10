"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createExperience, updateExperience } from "@/lib/actions/experience";
import { useToast } from "@/hooks/use-toast";

interface ExperienceFormProps {
  experience?: {
    id: string;
    title: string;
    organization: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    description: string | null;
    enabled: boolean;
  };
}

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function ExperienceForm({ experience }: ExperienceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const startRaw = formData.get("startDate") as string;
    const endRaw = formData.get("endDate") as string;
    formData.set("startDate", new Date(startRaw).toISOString());
    if (endRaw) formData.set("endDate", new Date(endRaw).toISOString());
    formData.set("isCurrent", formData.get("isCurrent") === "on" ? "true" : "false");
    formData.set("enabled", formData.get("enabled") === "on" ? "true" : "false");
    formData.set("displayOrder", "0");

    startTransition(async () => {
      const result = experience
        ? await updateExperience(experience.id, formData)
        : await createExperience(formData);

      if ("errors" in result && result.errors) {
        const firstError = Object.values(result.errors).flat()[0] as string;
        toast({
          variant: "destructive",
          title: firstError || "Please fix the errors",
        });
        return;
      }
      toast({ variant: "success", title: experience ? "Saved" : "Created" });
      router.push("/admin/experience");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Position / role</Label>
          <Input id="title" name="title" required defaultValue={experience?.title ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            name="organization"
            required
            defaultValue={experience?.organization ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" name="location" defaultValue={experience?.location ?? ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={toDateInput(experience?.startDate)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInput(experience?.endDate)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="isCurrent"
            name="isCurrent"
            defaultChecked={experience?.isCurrent ?? false}
          />
          <Label htmlFor="isCurrent">I currently work here</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={experience?.description ?? ""}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="enabled"
            name="enabled"
            defaultChecked={experience?.enabled ?? true}
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
          ) : experience ? (
            "Save Changes"
          ) : (
            "Create Entry"
          )}
        </Button>
      </div>
    </form>
  );
}