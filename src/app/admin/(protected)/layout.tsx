import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      <div className="flex flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}