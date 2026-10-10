"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpertise, updateExpertise } from "@/lib/actions/expertise";
import { useToast } from "@/hooks/use-toast";

const ICONS = [
  { value: "pill", label: "Pill" },
  { value: "shield", label: "Shield" },
  { value: "users", label: "Users" },
  { value: "message", label: "Message" },
  { value: "flask", label: "Flask" },
  { value: "book", label: "Book" },
  { value: "heart", label: "Heart" },
  { value: "activity", label: "Activity" },
];

interface ExpertiseFormProps {
  expertise?: {
    id: string;
    title: string;
    shortDescription: string | null;
    iconIdentifier: string | null;
    enabled: boolean;
  };
}

export function ExpertiseForm({ expertise }: ExpertiseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    formData.set("enabled", formData.get("enabled") === "on" ? "true" : "false");
    formData.set("displayOrder", "0");

    startTransition(async () => {
      const result = expertise
        ? await updateExpertise(expertise.id, formData)
        : await createExpertise(formData);

      if ("errors" in result && result.errors) {
        toast({ variant: "destructive", title: "Please fix the errors" });
        return;
      }
      toast({ variant: "success", title: expertise ? "Saved" : "Created" });
      router.push("/admin/expertise");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={expertise?.title ?? ""}
            placeholder="e.g. Medication Safety"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short description (optional)</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            rows={3}
            defaultValue={expertise?.shortDescription ?? ""}
            placeholder="A short sentence describing this area of expertise."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="iconIdentifier">Icon</Label>
          <Select
            name="iconIdentifier"
            defaultValue={expertise?.iconIdentifier ?? "pill"}
          >
            <SelectTrigger id="iconIdentifier">
              <SelectValue placeholder="Choose an icon" />
            </SelectTrigger>
            <SelectContent>
              {ICONS.map((icon) => (
                <SelectItem key={icon.value} value={icon.value}>
                  {icon.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            A simple visual identifier shown on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="enabled"
            name="enabled"
            defaultChecked={expertise?.enabled ?? true}
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
          ) : expertise ? (
            "Save Changes"
          ) : (
            "Create Expertise"
          )}
        </Button>
      </div>
    </form>
  );
}