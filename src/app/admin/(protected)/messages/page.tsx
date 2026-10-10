import Link from "next/link";
import { db } from "@/lib/db";
import { MessagesList } from "@/components/admin/messages-list";
import { cn } from "@/lib/utils";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status?.toUpperCase() as "UNREAD" | "READ" | "ARCHIVED" | undefined;

  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({
      where: filter ? { status: filter } : { status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
    }),
    db.contactMessage.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all])
  ) as Record<string, number>;

  const tabs = [
    {
      label: "Inbox",
      value: undefined,
      count: (countMap.UNREAD ?? 0) + (countMap.READ ?? 0),
    },
    { label: "Unread", value: "UNREAD", count: countMap.UNREAD ?? 0 },
    { label: "Archived", value: "ARCHIVED", count: countMap.ARCHIVED ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Messages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Messages sent through your contact form.
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => {
          const active = filter === tab.value || (!filter && !tab.value);
          const href = tab.value
            ? `/admin/messages?status=${tab.value.toLowerCase()}`
            : "/admin/messages";
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <MessagesList messages={messages} />
    </div>
  );
}