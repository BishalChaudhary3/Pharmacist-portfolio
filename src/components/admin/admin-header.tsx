"use client";

import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  user: { name: string | null; email: string };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="text-sm text-slate-500">{user.name || user.email}</div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const segments = pathname.replace("/admin/", "").split("/");
  const first = segments[0];
  const map: Record<string, string> = {
    homepage: "Homepage",
    about: "About",
    experience: "Experience",
    education: "Education",
    certifications: "Certifications",
    expertise: "Expertise",
    articles: "Articles",
    categories: "Categories",
    tags: "Tags",
    media: "Media",
    messages: "Messages",
    profile: "Profile",
    navigation: "Navigation",
    seo: "SEO",
    settings: "Site Settings",
  };
  if (segments[1] === "new") return "New Article";
  if (segments[1] && segments[2] === "edit") return "Edit Article";
  return map[first] || "Admin";
}