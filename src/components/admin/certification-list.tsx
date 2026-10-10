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
  deleteCertification,
  reorderCertifications,
  toggleCertification,
} from "@/lib/actions/certifications";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate: Date | null;
  enabled: boolean;
  displayOrder: number;
}

export function CertificationsList({
  certifications: initial,
}: {
  certifications: Certification[];
}) {
  const [items, setItems] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState<Certification | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(async () => {
      await reorderCertifications(next.map((i) => i.id));
    });
  };

  const toggle = (id: string, enabled: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)));
    startTransition(async () => {
      await toggleCertification(id, enabled);
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      await deleteCertification(confirmDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== confirmDelete.id));
      toast({ variant: "success", title: "Certification deleted" });
      setConfirmDelete(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-600">No certifications yet.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/certifications/new">Add your first certification</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {items.map((cert, idx) => (
          <li
            key={cert.id}
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
              <p className="truncate text-sm font-medium text-slate-900">{cert.name}</p>
              <p className="truncate text-xs text-slate-500">
                {cert.issuingOrganization} · Issued {formatDate(cert.issueDate)}
                {cert.expiryDate && ` · Expires ${formatDate(cert.expiryDate)}`}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Switch
                checked={cert.enabled}
                onCheckedChange={(v) => toggle(cert.id, v)}
                aria-label={cert.enabled ? "Hide certification" : "Show certification"}
              />
              {cert.enabled ? (
                <Eye className="h-3.5 w-3.5 text-slate-400" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button asChild size="sm" variant="ghost">
                <Link href={`/admin/certifications/${cert.id}/edit`} aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(cert)}
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
            <DialogTitle>Delete certification?</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{confirmDelete?.name}&rdquo;.
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