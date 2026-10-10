import { db } from "@/lib/db";
import { PageSectionEditor } from "@/components/admin/page-section-editor";

export default async function HomepageEditorPage() {
  const page = await db.page.findUnique({
    where: { slug: "homepage" },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const sections = (page?.sections ?? []).map((s) => ({
    id: s.id,
    type: s.type,
    displayOrder: s.displayOrder,
    enabled: s.enabled,
    content: (s.content ?? {}) as Record<string, unknown>,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Homepage</h2>
        <p className="mt-1 text-sm text-slate-500">
          Drag sections to reorder them. Toggle visibility with the switch. Click
          a section to edit its content.
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">
            No homepage sections configured. Run the seed script to create the
            default sections.
          </p>
        </div>
      ) : (
        <PageSectionEditor sections={sections} />
      )}
    </div>
  );
}