import { Pill, ShieldCheck, Users, MessageCircle, FlaskConical, BookOpen, Heart, Activity } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pill: Pill,
  shield: ShieldCheck,
  users: Users,
  message: MessageCircle,
  flask: FlaskConical,
  book: BookOpen,
  heart: Heart,
  activity: Activity,
};

interface ExpertiseItem {
  id: string;
  title: string;
  shortDescription: string | null;
  iconIdentifier: string | null;
}

interface ExpertiseProps {
  items: ExpertiseItem[];
  content: Record<string, unknown>;
}

export function Expertise({ items, content }: ExpertiseProps) {
  const heading = (content.heading as string) || "Areas of Expertise";
  const description =
    (content.description as string) ||
    "A focus on clarity, safety, and evidence-based practice.";

  if (items.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Expertise</p>
          <h2 className="mt-4 text-display-sm font-serif text-balance">{heading}</h2>
          <p className="mt-6 text-body-lg text-text-muted text-pretty">{description}</p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = ICONS[item.iconIdentifier || "pill"] || Pill;
            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-heading-3 font-serif">{item.title}</h3>
                {item.shortDescription && (
                  <p className="mt-3 text-sm text-text-muted">{item.shortDescription}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}