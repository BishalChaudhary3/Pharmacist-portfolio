import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArticleStatusBadge } from "@/components/admin/article-status-badge";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = statusParam?.toUpperCase() as
    | "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;

  const articles = await db.article.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Articles</h2>
        <Button asChild>
          <Link href="/admin/articles/new">+ New Article</Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <FilterTab href="/admin/articles" label="All" active={!status} />
        <FilterTab href="/admin/articles?status=draft" label="Drafts" active={status === "DRAFT"} />
        <FilterTab href="/admin/articles?status=published" label="Published" active={status === "PUBLISHED"} />
        <FilterTab href="/admin/articles?status=archived" label="Archived" active={status === "ARCHIVED"} />
      </div>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">No articles yet.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/articles/new">Create your first article</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {article.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ArticleStatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatDate(article.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm ${
        active ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}