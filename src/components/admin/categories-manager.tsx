"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/utils";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/categories";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  _count: { articles: number };
}

export function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      const result = await createCategory(formData);
      if ("errors" in result && result.errors) {
        const firstError = Object.values(result.errors).flat()[0] as string;
        toast({ variant: "destructive", title: firstError || "Failed to create" });
        return;
      }
      setCreating(false);
      toast({ variant: "success", title: "Category created" });
      window.location.reload();
    });
  };

  const handleUpdate = (id: string, formData: FormData) => {
    startTransition(async () => {
      const result = await updateCategory(id, formData);
      if ("errors" in result && result.errors) {
        const firstError = Object.values(result.errors).flat()[0] as string;
        toast({ variant: "destructive", title: firstError || "Failed to update" });
        return;
      }
      toast({ variant: "success", title: "Category updated" });
      setEditing(null);
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      const result = await deleteCategory(confirmDelete.id);
      if ("error" in result && result.error) {
        toast({ variant: "destructive", title: result.error });
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      toast({ variant: "success", title: "Category deleted" });
      setConfirmDelete(null);
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>

      <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {categories.length === 0 && !creating && (
          <li className="px-4 py-12 text-center text-sm text-slate-500">
            No categories yet.
          </li>
        )}

        {categories.map((cat) =>
          editing === cat.id ? (
            <li
              key={cat.id}
              className="border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <InlineCategoryForm
                initial={cat}
                onSubmit={(fd) => handleUpdate(cat.id, fd)}
                onCancel={() => setEditing(null)}
                pending={pending}
              />
            </li>
          ) : (
            <li
              key={cat.id}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                <p className="text-xs text-slate-500">
                  /articles?category={cat.slug} · {cat._count.articles} article
                  {cat._count.articles === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(cat.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(cat)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          )
        )}

        {creating && (
          <li className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <InlineCategoryForm
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
              pending={pending}
            />
          </li>
        )}
      </ul>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              &ldquo;{confirmDelete?.name}&rdquo; will be removed. Categories in use by
              articles cannot be deleted.
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

function InlineCategoryForm({
  initial,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: Category;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);

  return (
    <form action={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`name-${initial?.id ?? "new"}`}>Name</Label>
          <Input
            id={`name-${initial?.id ?? "new"}`}
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <Label htmlFor={`slug-${initial?.id ?? "new"}`}>Slug</Label>
          <Input
            id={`slug-${initial?.id ?? "new"}`}
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            required
          />
        </div>
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