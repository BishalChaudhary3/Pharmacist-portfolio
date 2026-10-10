import { listMedia } from "@/lib/actions/media";
import { MediaGrid } from "@/components/admin/media-grid";

export default async function MediaPage() {
  const media = await listMedia({ type: "all" });
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Media</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload and manage images and PDFs used across the site.
        </p>
      </div>
      <MediaGrid initialMedia={media} />
    </div>
  );
}