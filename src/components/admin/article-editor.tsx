"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "./rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { createArticle, updateArticle } from "@/lib/actions/articles";
import { slugify } from "@/lib/utils";

interface Category { id: string; name: string; slug: string }
interface Tag { id: string; name: string; slug: string }

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
    seoTitle: string | null;
    seoDescription: string | null;
    tags: { tagId: string }[];
  };
}

export function ArticleEditorForm({ categories, tags, article }: ArticleEditorFormProps) {
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
    formData.set("content", content);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("status", status);
    formData.set("tagIds", JSON.stringify(selectedTags));

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

      toast({ variant: "success", title: article ? "Article saved" : "Article created" });
      if (article) router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
          <Label htmlFor="slug">Slug (web address)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
          />
          <p className="text-xs text-slate-500">
            The web address used for this article. e.g. /articles/{slug || "my-article"}
          </p>
          {errors.slug && <p className="text-xs text-red-600">{errors.slug[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" name="excerpt" rows={3} defaultValue={article?.excerpt || ""} />
          <p className="text-xs text-slate-500">
            A short summary that appears in listings and search results.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-900">Publishing</h3>

          <div className="mt-4 space-y-3">
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
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={article?.categoryId || ""}
                className="mt-1 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                name="isFeatured"
                defaultChecked={article?.isFeatured}
                value="true"
              />
              <Label htmlFor="isFeatured">Featured on homepage</Label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-900">SEO</h3>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" name="seoTitle" defaultValue={article?.seoTitle || ""} maxLength={60} />
            </div>
            <div>
              <Label htmlFor="seoDescription">Meta Description</Label>
              <Textarea
                id="seoDescription"
                name="seoDescription"
                rows={3}
                defaultValue={article?.seoDescription || ""}
                maxLength={160}
              />
              <p className="text-xs text-slate-500">
                Write a short description that may appear in search engine results.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : article ? "Save Changes" : "Create Article"}
          </Button>
          {article && (
            <Button variant="outline" type="button" asChild>
              <a href={`/articles/${slug}`} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </Button>
          )}
        </div>
      </aside>
    </form>
  );
}