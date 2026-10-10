"use client";

import { useState, useTransition } from "react";
import { FileText, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ImageUploader } from "./image-uploader";
import { updateMedia, deleteMedia } from "@/lib/actions/media";
import { useToast } from "@/hooks/use-toast";
import type { MediaRecord } from "@/lib/types/media";

export function MediaGrid({ initialMedia }: { initialMedia: MediaRecord[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [editing, setEditing] = useState<MediaRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaRecord | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleUploaded = (uploaded: MediaRecord) => {
    setMedia((prev) => [uploaded, ...prev]);
  };

  const handleSaveMeta = (formData: FormData) => {
    if (!editing) return;
    startTransition(async () => {
      const result = await updateMedia(editing.id, formData);
      if ("success" in result) {
        setMedia((prev) =>
          prev.map((m) =>
            m.id === editing.id
              ? {
                  ...m,
                  altText: (formData.get("altText") as string) || null,
                  caption: (formData.get("caption") as string) || null,
                }
              : m
          )
        );
        toast({ variant: "success", title: "Saved" });
        setEditing(null);
      }
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const result = await deleteMedia(confirmDelete.id);
      if ("error" in result && result.error) {
        toast({ variant: "destructive", title: result.error });
        return;
      }
      setMedia((prev) => prev.filter((m) => m.id !== confirmDelete.id));
      toast({ variant: "success", title: "File deleted" });
      setConfirmDelete(null);
    });
  };

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <ImageUploader onUploaded={handleUploaded} accept="both" label="Upload file" />
      </div>

      {media.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          No files yet. Upload your first one above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="relative aspect-video bg-slate-100">
                {m.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.altText || m.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <FileText className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => setEditing(m)}
                    aria-label="Edit details"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 text-red-600"
                    onClick={() => setConfirmDelete(m)}
                    aria-label="Delete file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-slate-900">{m.filename}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {(m.size / 1024).toFixed(0)} KB ·{" "}
                  {new Date(m.createdAt).toLocaleDateString()}
                </p>
                {m.altText && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">
                    Alt: {m.altText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit metadata modal */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit file details</DialogTitle>
            <DialogDescription>
              Help visitors using screen readers understand the image.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form action={handleSaveMeta} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="altText">Alt text</Label>
                <Input
                  id="altText"
                  name="altText"
                  defaultValue={editing.altText ?? ""}
                  placeholder="Describe the image for visitors using screen readers."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input
                  id="caption"
                  name="caption"
                  defaultValue={editing.caption ?? ""}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file?</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>{confirmDelete?.filename}</strong>.
              {" "}If it is used anywhere on the site, deletion will be blocked.
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