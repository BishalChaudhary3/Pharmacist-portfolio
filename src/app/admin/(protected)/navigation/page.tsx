import { db } from "@/lib/db";
import { NavigationEditor } from "@/components/admin/navigation-editor";

export default async function NavigationPage() {
  const items = await db.navigationItem.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Navigation</h2>
        <p className="mt-1 text-sm text-slate-500">
          The menu items that appear in your site header.
        </p>
      </div>
      <NavigationEditor items={items} />
    </div>
  );
}