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
import { deleteEducation, reorderEducation, toggleEducation } from "@/lib/actions/education";
import { formatDateShort } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  enabled: boolean;
  displayOrder: number;
}

export function EducationList({ education: initial }: { education: Education[] }) {
  const [items, setItems] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState<Education | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(async () => {
      await reorderEducation(next.map((i) => i.id));
    });
  };

  const toggle = (id: string, enabled: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)));
    startTransition(async () => {
      await toggleEducation(id, enabled);
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      await deleteEducation(confirmDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id));
      toast({ variant: "success", title: "Entry deleted" });
      setConfirmDelete(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-600">No education entries yet.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/education/new">Add your first entry</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {items.map((edu, idx) => (
          <li
            key={edu.id}
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
              <p className="truncate text-sm font-medium text-slate-900">{edu.degree}</p>
              <p className="truncate text-xs text-slate-500">
                {edu.institution}
                {edu.field && ` · ${edu.field}`}
                {edu.location && ` · ${edu.location}`} · {formatDateShort(edu.startDate)} –{" "}
                {edu.endDate ? formatDateShort(edu.endDate) : "Present"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Switch
                checked={edu.enabled}
                onCheckedChange={(v) => toggle(edu.id, v)}
                aria-label={edu.enabled ? "Hide entry" : "Show entry"}
              />
              {edu.enabled ? (
                <Eye className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button asChild size="sm" variant="ghost">
                <Link href={`/admin/education/${edu.id}/edit`} aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(edu)}
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
            <DialogTitle>Delete education entry?</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{confirmDelete?.degree}&rdquo; from{" "}
              {confirmDelete?.institution}.
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