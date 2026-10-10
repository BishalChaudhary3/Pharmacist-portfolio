"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  deleteExpertise,
  reorderExpertise,
  toggleExpertise,
} from "@/lib/actions/expertise";
import { useToast } from "@/hooks/use-toast";

interface Expertise {
  id: string;
  title: string;
  shortDescription: string | null;
  iconIdentifier: string | null;
  enabled: boolean;
  displayOrder: number;
}

export function ExpertiseList({ expertise: initial }: { expertise: Expertise[] }) {
  const [items, setItems] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState<Expertise | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(async () => {
      await reorderExpertise(next.map((i) => i.id));
    });
  };

  const toggle = (id: string, enabled: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)));
    startTransition(async () => {
      await toggleExpertise(id, enabled);
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      await deleteExpertise(confirmDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id));
      toast({ variant: "success", title: "Expertise deleted" });
      setConfirmDelete(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-600">No expertise items yet.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/expertise/new">Add your first item</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0 || pending}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1 || pending}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
              <p className="truncate text-xs text-slate-500">
                Icon: {item.iconIdentifier || "pill"}
                {item.shortDescription && ` · ${item.shortDescription}`}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Switch
                checked={item.enabled}
                onCheckedChange={(v) => toggle(item.id, v)}
                aria-label={item.enabled ? "Hide item" : "Show item"}
              />
              {item.enabled ? (
                <Eye className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button asChild size="sm" variant="ghost">
                <Link href={`/admin/expertise/${item.id}/edit`} aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(item)}
                aria-label="Delete"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete expertise item?</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{confirmDelete?.title}&rdquo;.
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