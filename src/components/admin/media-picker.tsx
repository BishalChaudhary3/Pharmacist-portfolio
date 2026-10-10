"use client";

import { useEffect, useState, useTransition } from "react";
import { FileText, Loader2, Check, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "./image-uploader";
import { listMedia, deleteMedia } from "@/lib/actions/media";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { MediaRecord } from "@/lib/types/media";

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter?: "image" | "pdf" | "all";
  onSelect: (media: MediaRecord) => void;
  onDelete?: (mediaId: string) => void;
}

export function MediaPicker({
  open,
  onOpenChange,
  filter = "image",
  onSelect,
  onDelete,
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const refresh = () => {
    startTransition(async () => {
      const items = await listMedia({ type: filter });
      setMedia(items as MediaRecord[]);
    });
  };

  useEffect(() => {
    if (open) {
      refresh();
      setConfirmingDelete(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDelete = (id: string) => {
    setDeleting(id);
    startTransition(async () => {
      const result = await deleteMedia(id);

      if ("error" in result && result.error) {
        toast({ variant: "destructive", title: result.error });
        setDeleting(null);
        setConfirmingDelete(null);
        return;
      }

      setMedia((prev) => prev.filter((m) => m.id !== id));
      onDelete?.(id);
      toast({ variant: "success", title: "File deleted" });
      setDeleting(null);
      setConfirmingDelete(null);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose from library</DialogTitle>
          <DialogDescription>
            Select an existing file or upload a new one. Hover a thumbnail to
            delete it from your library.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto">
          <ImageUploader
            accept={filter === "pdf" ? "pdf" : "image"}
            onUploaded={(uploaded) => {
              setMedia((prev) => [uploaded as MediaRecord, ...prev]);
              onSelect(uploaded as MediaRecord);
              onOpenChange(false);
            }}
            label="Upload new file"
          />

          <div className="mt-6">
            {pending && media.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : media.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No files yet. Upload one above.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((item) => {
                  const isConfirming = confirmingDelete === item.id;
                  const isDeleting = deleting === item.id;

                  return (
                    <div
                      key={item.id}
                      className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                    >
                      {/* Thumbnail — clicking selects it, unless confirming delete */}
                      <button
                        type="button"
                        disabled={isConfirming || isDeleting}
                        onClick={() => {
                          onSelect(item);
                          onOpenChange(false);
                        }}
                        className="absolute inset-0 h-full w-full"
                        aria-label={`Select ${item.filename}`}
                      >
                        {item.mimeType.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.altText || item.filename}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                            <FileText className="h-8 w-8" />
                            <span className="px-2 text-center text-[10px] leading-tight">
                              {item.filename}
                            </span>
                          </div>
                        )}
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/80 opacity-0 transition-opacity group-hover:opacity-100">
                          <Check className="h-6 w-6 text-white" />
                        </span>
                      </button>

                      {/* Delete button — visible on hover, hidden while confirming */}
                      {!isConfirming && !isDeleting && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingDelete(item.id);
                          }}
                          className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          aria-label={`Delete ${item.filename}`}
                          title={`Delete ${item.filename}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Inline delete confirmation */}
                      {isConfirming && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-slate-900/80 p-2 text-center">
                          <p className="text-xs font-medium text-white">
                            Delete this file?
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDelete(null);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 hover:bg-slate-100"
                              aria-label="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              disabled={isDeleting}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                              aria-label="Confirm delete"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Deleting spinner overlay */}
                      {isDeleting && !isConfirming && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}