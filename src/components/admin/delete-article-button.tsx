"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteArticle } from "@/lib/actions/articles";
import { useToast } from "@/hooks/use-toast";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteArticle(id);
      if ("error" in result && result.error) {
        toast({ variant: "destructive", title: result.error });
        return;
      }
      toast({ variant: "success", title: "Article deleted" });
      setOpen(false);
      router.refresh(); // Refresh the list
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        aria-label="Delete article"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article?</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{title}&rdquo;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}