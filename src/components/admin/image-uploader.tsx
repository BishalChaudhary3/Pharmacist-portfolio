"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/actions/media";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { MediaRecord } from "@/lib/types/media";

interface ImageUploaderProps {
  accept?: "image" | "pdf" | "both";
  onUploaded: (media: MediaRecord) => void;
  className?: string;
  label?: string;
}

export function ImageUploader({
  accept = "image",
  onUploaded,
  className,
  label = "Upload file",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  const acceptAttr =
    accept === "image"
      ? "image/jpeg,image/png,image/webp"
      : accept === "pdf"
      ? "application/pdf"
      : "image/jpeg,image/png,image/webp,application/pdf";

  const handleFile = (file: File) => {
    const fd = new FormData();
    fd.set("file", file);

    startTransition(async () => {
      const result = await uploadMedia(fd);

      if ("error" in result && result.error) {
        toast({ variant: "destructive", title: result.error });
        return;
      }
      if ("success" in result && result.success && "media" in result) {
        toast({ variant: "success", title: "Uploaded", description: file.name });
        onUploaded(result.media);
      }
    });
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors",
        dragging && "border-primary bg-primary/5",
        className
      )}
    >
      <Upload className="h-6 w-6 text-slate-400" />
      <p className="mt-3 text-sm text-slate-600">
        Drag and drop, or
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
          </>
        ) : (
          label
        )}
      </Button>
      <p className="mt-2 text-xs text-slate-400">
        JPG, PNG, WebP{accept !== "image" ? ", or PDF" : ""} · up to 10MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}