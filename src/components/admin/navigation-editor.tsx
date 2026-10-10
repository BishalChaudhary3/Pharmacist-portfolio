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
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  reorderNavigationItems,
  toggleNavigationItem,
} from "@/lib/actions/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useId } from "react";

interface NavItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  enabled: boolean;
  displayOrder: number;
}

export function NavigationEditor({ items: initial }: { items: NavItem[] }) {
  const dndContextId = useId();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<NavItem | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startTransition(async () => {
      await reorderNavigationItems(next.map((i) => i.id));
    });
  };

  const toggle = (id: string, enabled: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)));
    startTransition(async () => {
      await toggleNavigationItem(id, enabled);
    });
  };

  const handleCreate = (formData: FormData) => {
    formData.set("isExternal", formData.get("isExternal") === "on" ? "true" : "false");
    formData.set("enabled", "true");
    formData.set("displayOrder", String(items.length));

    startTransition(async () => {
      const result = await createNavigationItem(formData);
      if ("errors" in result && result.errors) {
        const first = Object.values(result.errors).flat()[0] as string;
        toast({ variant: "destructive", title: first });
        return;
      }
      setCreating(false);
      toast({ variant: "success", title: "Item created" });
      window.location.reload();
    });
  };

  const handleUpdate = (id: string, formData: FormData) => {
    formData.set("isExternal", formData.get("isExternal") === "on" ? "true" : "false");
    formData.set("enabled", "true");
    formData.set("displayOrder", "0");

    startTransition(async () => {
      const result = await updateNavigationItem(id, formData);
      if ("errors" in result && result.errors) {
        const first = Object.values(result.errors).flat()[0] as string;
        toast({ variant: "destructive", title: first });
        return;
      }
      setEditing(null);
      toast({ variant: "success", title: "Item updated" });
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      await deleteNavigationItem(confirmDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id));
      toast({ variant: "success", title: "Item deleted" });
      setConfirmDelete(null);
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" /> New Item
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Menu items
        </div>

        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {items.map((item) =>
                editing === item.id ? (
                  <li key={item.id} className="border-b border-slate-100 p-4">
                    <InlineNavForm
                      initial={item}
                      onSubmit={(fd) => handleUpdate(item.id, fd)}
                      onCancel={() => setEditing(null)}
                      pending={pending}
                    />
                  </li>
                ) : (
                  <SortableNavRow
                    key={item.id}
                    item={item}
                    onEdit={() => setEditing(item.id)}
                    onDelete={() => setConfirmDelete(item)}
                    onToggle={(enabled) => toggle(item.id, enabled)}
                  />
                )
              )}
            </ul>
          </SortableContext>
        </DndContext>

        {creating && (
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <InlineNavForm
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
              pending={pending}
            />
          </div>
        )}

        {items.length === 0 && !creating && (
          <p className="px-4 py-12 text-center text-sm text-slate-500">
            No menu items yet. Click &ldquo;New Item&rdquo; to add one.
          </p>
        )}
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete menu item?</DialogTitle>
            <DialogDescription>
              &ldquo;{confirmDelete?.label}&rdquo; will be removed from the navigation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SortableNavRow({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: NavItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{item.label}</p>
        <p className="truncate text-xs text-slate-500">
          {item.isExternal && <ExternalLink className="mr-1 inline h-3 w-3" />}
          {item.url}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Switch
          checked={item.enabled}
          onCheckedChange={onToggle}
          aria-label={item.enabled ? "Hide item" : "Show item"}
        />
        {item.enabled ? (
          <Eye className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-slate-400" />
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="text-red-600 hover:bg-red-50"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

function InlineNavForm({
  initial,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: NavItem;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <form action={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`label-${initial?.id ?? "new"}`}>Label</Label>
          <Input
            id={`label-${initial?.id ?? "new"}`}
            name="label"
            defaultValue={initial?.label ?? ""}
            required
          />
        </div>
        <div>
          <Label htmlFor={`url-${initial?.id ?? "new"}`}>URL</Label>
          <Input
            id={`url-${initial?.id ?? "new"}`}
            name="url"
            defaultValue={initial?.url ?? ""}
            placeholder="/about or https://example.com"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`ext-${initial?.id ?? "new"}`}
          name="isExternal"
          defaultChecked={initial?.isExternal ?? false}
          className="h-4 w-4 rounded border-slate-300"
        />
        <Label htmlFor={`ext-${initial?.id ?? "new"}`}>External link</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="mr-1 h-3.5 w-3.5" /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Check className="mr-1 h-3.5 w-3.5" /> Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}