"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  FileText,
  FolderOpen,
  Tag,
  Image as ImageIcon,
  Mail,
  Settings,
  Navigation,
  Search,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_GROUPS = [
  {
    label: null,
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Website",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: Home },
      { label: "About", href: "/admin/about", icon: User },
      { label: "Experience", href: "/admin/experience", icon: Briefcase },
      { label: "Education", href: "/admin/education", icon: GraduationCap },
      { label: "Certifications", href: "/admin/certifications", icon: Award },
      { label: "Expertise", href: "/admin/expertise", icon: Sparkles },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Articles", href: "/admin/articles", icon: FileText },
      { label: "Categories", href: "/admin/categories", icon: FolderOpen },
      { label: "Tags", href: "/admin/tags", icon: Tag },
      { label: "Media", href: "/admin/media", icon: ImageIcon },
      { label: "Messages", href: "/admin/messages", icon: Mail },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Profile", href: "/admin/profile", icon: User },
      { label: "Navigation", href: "/admin/navigation", icon: Navigation },
      { label: "SEO", href: "/admin/seo", icon: Search },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  user: { name: string | null; email: string; role: string };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/admin" className="font-semibold text-slate-900">
          Admin
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {NAV_GROUPS.map((group, i) => (
          <div key={i}>
            {group.label && (
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                        active && "bg-slate-100 text-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 px-3">
          <p className="truncate text-sm font-medium text-slate-900">
            {user.name || user.email}
          </p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}