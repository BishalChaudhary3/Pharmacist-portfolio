import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Archive, Star } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    featuredArticles,
    recentArticles,
    recentMessages,
  ] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.article.count({ where: { status: "DRAFT" } }),
    db.article.count({ where: { isFeatured: true } }),
    db.article.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    }),
    db.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { status: "UNREAD" },
    }),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {greeting}, {user?.name || "there"}
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s what&apos;s happening with your website.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Published</CardTitle>
            <Eye className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{publishedArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Drafts</CardTitle>
            <Archive className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{draftArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Featured</CardTitle>
            <Star className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{featuredArticles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/articles/new">+ New Article</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/homepage">Edit Homepage</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/profile">Edit Profile</Link>
        </Button>
      </div>

      {/* Recent Articles */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Articles</CardTitle>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <p className="text-sm text-slate-500">No articles yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentArticles.map((article) => (
                  <li key={article.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {article.title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {article.category?.name || "Uncategorized"} ·{" "}
                        {article.status.toLowerCase()}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-slate-500">No unread messages.</p>
            ) : (
              <ul className="space-y-3">
                {recentMessages.map((msg) => (
                  <li key={msg.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{msg.name}</p>
                      <p className="text-xs text-slate-500">{msg.subject}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}