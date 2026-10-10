"use client";

import { useState } from "react";
import { FileText, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "./media-picker";
import type { MediaRecord } from "@/lib/types/media";

interface ImageFieldProps {
  value: string | null;
  onChange: (mediaId: string | null, media: MediaRecord | null) => void;
  initialMedia?: MediaRecord | null;
  filter?: "image" | "pdf" | "all";
  label?: string;
}

export function ImageField({
  value,
  onChange,
  initialMedia,
  filter = "image",
  label,
}: ImageFieldProps) {
  const [media, setMedia] = useState<MediaRecord | null>(initialMedia ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (selected: MediaRecord) => {
    setMedia(selected);
    onChange(selected.id, selected);
  };

  const handleRemove = () => {
    setMedia(null);
    onChange(null, null);
  };

  const handleDeleted = (mediaId: string) => {
    // If the currently-selected file was just deleted from the library,
    // clear the field so it doesn't point to a broken URL.
    if (media?.id === mediaId) {
      setMedia(null);
      onChange(null, null);
    }
  };

  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-medium text-text-primary">{label}</p>
      )}

      {media ? (
        <div className="flex items-start gap-4 rounded-md border border-border bg-surface p-3">
          {media.mimeType.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt={media.altText || media.filename}
              className="h-24 w-24 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-slate-100 text-slate-400">
              <FileText className="h-8 w-8" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">
              {media.filename}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {(media.size / 1024).toFixed(0)} KB
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                aria-label="Remove file"
                title="Remove from this field (does not delete from library)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          {filter === "pdf" ? (
            <FileText className="h-6 w-6 text-slate-400" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-400" />
          )}
          <span className="mt-2 text-sm text-slate-600">
            {filter === "pdf" ? "Choose a PDF" : "Choose an image"}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">
            or upload a new one
          </span>
        </button>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        filter={filter}
        onSelect={handleSelect}
        onDelete={handleDeleted}
      />
    </div>
  );
}