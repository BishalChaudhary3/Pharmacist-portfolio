"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "./rich-text-editor";
import { ImageField } from "./image-field";
import { useToast } from "@/hooks/use-toast";
import { createArticle, updateArticle } from "@/lib/actions/articles";
import { slugify } from "@/lib/utils";

type MediaRecord = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  altText: string | null;
  caption: string | null;
  size: number;
};

interface Category {
  id: string;
  name: string;
  slug: string;
}
interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleEditorFormProps {
  categories: Category[];
  tags: Tag[];
  article?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    categoryId: string | null;
    status: string;
    isFeatured: boolean;
    featuredOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    coverImageId: string | null;
    coverImage: MediaRecord | null;
    ogImageId: string | null;
    ogImage: MediaRecord | null;
    tags: { tagId: string }[];
  };
}

export function ArticleEditorForm({
  categories,
  tags,
  article,
}: ArticleEditorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [content, setContent] = useState(article?.content || "");
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags.map((t) => t.tagId) || []
  );
  const [status, setStatus] = useState(article?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [coverImageId, setCoverImageId] = useState<string | null>(
    article?.coverImageId ?? null
  );
  const [ogImageId, setOgImageId] = useState<string | null>(
    article?.ogImageId ?? null
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = (formData: FormData) => {
    // Detect which button submitted the form.
    // "publish" button sets name="action" value="publish"
    const action = formData.get("action") as string | null;
    const finalStatus =
      action === "publish" ? "PUBLISHED" : status;

    if (action === "publish") setStatus("PUBLISHED");

    formData.set("content", content);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("status", finalStatus);
    formData.set("tagIds", JSON.stringify(selectedTags));
    formData.set("coverImageId", coverImageId ?? "");
    formData.set("ogImageId", ogImageId ?? "");
    formData.set("isFeatured", isFeatured ? "true" : "false");
    formData.set("featuredOrder", String(article?.featuredOrder ?? 0));

    startTransition(async () => {
      const result = article
        ? await updateArticle(article.id, formData)
        : await createArticle(formData);

      if (result && "errors" in result && result.errors) {
        setErrors(result.errors as Record<string, string[]>);
        toast({ variant: "destructive", title: "Please fix the errors below" });
        return;
      }

      if (result && "error" in result && result.error) {
        toast({ variant: "destructive", title: result.error });
        return;
      }

      toast({
        variant: "success",
        title:
          action === "publish"
            ? "Article published"
            : article
            ? "Article saved"
            : "Article created",
      });
      if (article) router.refresh();
    });
  };

  const isPublished = status === "PUBLISHED";

  return (
    <form action={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
          {errors.title && <p className="text-xs text-red-600">{errors.title[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Web address (slug)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
          <p className="text-xs text-slate-500">
            /articles/{slug || "my-article"}
          </p>
          {errors.slug && <p className="text-xs text-red-600">{errors.slug[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={article?.excerpt ?? ""}
          />
          <p className="text-xs text-slate-500">
            A short summary shown in listings and search results.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Cover image</Label>
          <ImageField
            value={coverImageId}
            initialMedia={article?.coverImage ?? null}
            onChange={(id) => setCoverImageId(id)}
            filter="image"
          />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-900">Publishing</h3>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Use the buttons below for quick actions.
            </p>
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={article?.categoryId ?? ""}
              className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    selectedTags.includes(t.id)
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="isFeatured">Featured on homepage</Label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
          <h3 className="text-sm font-medium text-slate-900">SEO</h3>

          <div>
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input
              id="seoTitle"
              name="seoTitle"
              defaultValue={article?.seoTitle ?? ""}
              maxLength={60}
            />
          </div>

          <div>
            <Label htmlFor="seoDescription">Meta description</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              rows={3}
              defaultValue={article?.seoDescription ?? ""}
              maxLength={160}
            />
          </div>

          <div>
            <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
            <Input
              id="canonicalUrl"
              name="canonicalUrl"
              type="url"
              defaultValue={article?.canonicalUrl ?? ""}
              placeholder="https://example.com/articles/..."
            />
          </div>

          <div>
            <Label>Social sharing image (optional)</Label>
            <p className="mb-2 text-xs text-slate-500">
              Falls back to the cover image.
            </p>
            <ImageField
              value={ogImageId}
              initialMedia={article?.ogImage ?? null}
              onChange={(id) => setOgImageId(id)}
              filter="image"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button type="submit" variant="outline" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save
                </>
              )}
            </Button>

            <Button
              type="submit"
              name="action"
              value="publish"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPublished ? (
                "Republish"
              ) : (
                "Publish"
              )}
            </Button>
          </div>

          {article && (
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/articles/${article.id}/preview`}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Link>
            </Button>
          )}

          {!article && (
            <p className="text-xs text-slate-500 text-center">
              Save the article first to enable preview.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}