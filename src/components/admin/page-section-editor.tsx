"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Home,
  User,
  Sparkles,
  FileText,
  Briefcase,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "./image-field";
import {
  reorderPageSections,
  togglePageSection,
  updatePageSectionContent,
} from "@/lib/actions/page-sections";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useId } from "react";

type MediaRecord = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  altText: string | null;
  caption: string | null;
  size: number;
};

interface Section {
  id: string;
  type: string;
  displayOrder: number;
  enabled: boolean;
  content: Record<string, unknown>;
}

const SECTION_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  HERO: { label: "Hero", icon: Home },
  ABOUT_PREVIEW: { label: "About Preview", icon: User },
  EXPERTISE: { label: "Expertise", icon: Sparkles },
  FEATURED_ARTICLES: { label: "Featured Articles", icon: FileText },
  EXPERIENCE_PREVIEW: { label: "Experience Preview", icon: Briefcase },
  CTA: { label: "Call to Action", icon: Megaphone },
};

export function PageSectionEditor({ sections: initial }: { sections: Section[] }) {
  const dndContextId = useId();
  const [sections, setSections] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(initial[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const next = arrayMove(sections, oldIndex, newIndex);
    setSections(next);

    startTransition(async () => {
      await reorderPageSections(next.map((s) => s.id));
      toast({ variant: "success", title: "Section order saved" });
    });
  };

  const toggle = (id: string, enabled: boolean) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled } : s)));
    startTransition(async () => {
      await togglePageSection(id, enabled);
    });
  };

  const updateContent = (id: string, content: Record<string, unknown>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: { ...s.content, ...content } } : s))
    );
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              expanded={expanded === section.id}
              onToggleExpand={() =>
                setExpanded(expanded === section.id ? null : section.id)
              }
              onToggleEnabled={(enabled) => toggle(section.id, enabled)}
              onContentChange={(content) => updateContent(section.id, content)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableSection({
  section,
  expanded,
  onToggleExpand,
  onToggleEnabled,
  onContentChange,
}: {
  section: Section;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onContentChange: (content: Record<string, unknown>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = SECTION_META[section.type] ?? {
    label: section.type,
    icon: FileText,
  };
  const Icon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 bg-white",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Icon className="h-4 w-4 text-slate-400" />

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 text-left"
        >
          <p className="text-sm font-medium text-slate-900">{meta.label}</p>
          <p className="text-xs text-slate-500">
            {section.enabled ? "Visible on website" : "Hidden"}
          </p>
        </button>

        <div className="flex items-center gap-2">
          <Switch
            checked={section.enabled}
            onCheckedChange={onToggleEnabled}
            aria-label={section.enabled ? "Hide section" : "Show section"}
          />
          {section.enabled ? (
            <Eye className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-slate-400" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <SectionContentForm
            sectionId={section.id}
            type={section.type}
            content={section.content}
            onContentChange={onContentChange}
          />
        </div>
      )}
    </div>
  );
}

function SectionContentForm({
  sectionId,
  type,
  content,
  onContentChange,
}: {
  sectionId: string;
  type: string;
  content: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Record<string, unknown>>(content);
  const [coverImage, setCoverImage] = useState<MediaRecord | null>(
    (content.coverImage as MediaRecord) ?? null
  );

  const updateField = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = { ...draft };
    if (coverImage) payload.coverImage = coverImage;
    startTransition(async () => {
      await updatePageSectionContent(sectionId, payload);
      onContentChange(payload);
      toast({ variant: "success", title: "Section saved" });
    });
  };

  return (
    <div className="space-y-4">
      {type === "HERO" && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-eyebrow`}>Eyebrow label</Label>
            <Input
              id={`${sectionId}-eyebrow`}
              value={(draft.eyebrow as string) ?? ""}
              onChange={(e) => updateField("eyebrow", e.target.value)}
              placeholder="PHARMACIST • HEALTHCARE WRITER"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-heading`}>Main heading</Label>
            <Input
              id={`${sectionId}-heading`}
              value={(draft.heading as string) ?? ""}
              onChange={(e) => updateField("heading", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-description`}>Description</Label>
            <Textarea
              id={`${sectionId}-description`}
              rows={3}
              value={(draft.description as string) ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-primary-text`}>Primary button text</Label>
              <Input
                id={`${sectionId}-primary-text`}
                value={(draft.primaryButtonText as string) ?? ""}
                onChange={(e) => updateField("primaryButtonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-primary-url`}>Primary button URL</Label>
              <Input
                id={`${sectionId}-primary-url`}
                value={(draft.primaryButtonUrl as string) ?? ""}
                onChange={(e) => updateField("primaryButtonUrl", e.target.value)}
                placeholder="/articles"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-secondary-text`}>Secondary button text</Label>
              <Input
                id={`${sectionId}-secondary-text`}
                value={(draft.secondaryButtonText as string) ?? ""}
                onChange={(e) => updateField("secondaryButtonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-secondary-url`}>Secondary button URL</Label>
              <Input
                id={`${sectionId}-secondary-url`}
                value={(draft.secondaryButtonUrl as string) ?? ""}
                onChange={(e) => updateField("secondaryButtonUrl", e.target.value)}
                placeholder="/about"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hero image (optional)</Label>
            <ImageField
              value={coverImage?.id ?? null}
              initialMedia={coverImage}
              onChange={(id, media) => setCoverImage(media)}
              filter="image"
            />
          </div>
        </>
      )}

      {type === "ABOUT_PREVIEW" && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-heading`}>Heading</Label>
            <Input
              id={`${sectionId}-heading`}
              value={(draft.heading as string) ?? ""}
              onChange={(e) => updateField("heading", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-description`}>Description</Label>
            <Textarea
              id={`${sectionId}-description`}
              rows={3}
              value={(draft.description as string) ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-btn-text`}>Button text</Label>
              <Input
                id={`${sectionId}-btn-text`}
                value={(draft.buttonText as string) ?? ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-btn-url`}>Button URL</Label>
              <Input
                id={`${sectionId}-btn-url`}
                value={(draft.buttonUrl as string) ?? ""}
                onChange={(e) => updateField("buttonUrl", e.target.value)}
                placeholder="/about"
              />
            </div>
          </div>
        </>
      )}

      {(type === "EXPERTISE" || type === "FEATURED_ARTICLES") && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-heading`}>Section heading</Label>
            <Input
              id={`${sectionId}-heading`}
              value={(draft.heading as string) ?? ""}
              onChange={(e) => updateField("heading", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-description`}>Section description</Label>
            <Textarea
              id={`${sectionId}-description`}
              rows={2}
              value={(draft.description as string) ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </>
      )}

      {type === "EXPERIENCE_PREVIEW" && (
        <div className="space-y-2">
          <Label htmlFor={`${sectionId}-heading`}>Section heading</Label>
          <Input
            id={`${sectionId}-heading`}
            value={(draft.heading as string) ?? ""}
            onChange={(e) => updateField("heading", e.target.value)}
          />
        </div>
      )}

      {type === "CTA" && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-heading`}>Heading</Label>
            <Input
              id={`${sectionId}-heading`}
              value={(draft.heading as string) ?? ""}
              onChange={(e) => updateField("heading", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${sectionId}-description`}>Description</Label>
            <Textarea
              id={`${sectionId}-description`}
              rows={2}
              value={(draft.description as string) ?? ""}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-btn-text`}>Button text</Label>
              <Input
                id={`${sectionId}-btn-text`}
                value={(draft.buttonText as string) ?? ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${sectionId}-btn-url`}>Button URL</Label>
              <Input
                id={`${sectionId}-btn-url`}
                value={(draft.buttonUrl as string) ?? ""}
                onChange={(e) => updateField("buttonUrl", e.target.value)}
                placeholder="/articles"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={pending} size="sm">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-3.5 w-3.5" /> Save Section
            </>
          )}
        </Button>
      </div>
    </div>
  );
}