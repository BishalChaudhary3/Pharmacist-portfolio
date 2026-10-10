import { Badge } from "@/components/ui/badge";

const VARIANTS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  SCHEDULED: "scheduled",
} as const;

export function ArticleStatusBadge({ status }: { status: keyof typeof VARIANTS }) {
  return <Badge variant={VARIANTS[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}