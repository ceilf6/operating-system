import { SourceCard } from "../../lib/content";
import { SourceDrawer } from "./SourceDrawer";

interface SourcePackSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  items: SourceCard[];
  emptyMessage: string;
}

export function SourcePackSection({
  eyebrow,
  title,
  description,
  items,
  emptyMessage,
}: SourcePackSectionProps) {
  return (
    <section className="glass-card rounded-[32px] p-6">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">{title}</h2>
      {description ? (
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--ink-2)]">{description}</p>
      ) : null}
      {items.length ? (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <SourceDrawer key={item.sourceId} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-dashed border-[rgba(15,31,49,0.14)] bg-white/55 px-5 py-4 text-sm leading-7 text-[color:var(--ink-2)]">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
