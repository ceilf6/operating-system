import { CourseSection } from "../../lib/content";

interface AnchorNavProps {
  sections: CourseSection[];
}

export function AnchorNav({ sections }: AnchorNavProps) {
  return (
    <div className="glass-card sticky top-24 rounded-[28px] p-5">
      <div className="eyebrow">Section Anchors</div>
      <h3 className="page-title mt-4 text-xl text-[color:var(--ink-1)]">章节锚点</h3>
      <div className="mt-4 space-y-3">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.anchor}`}
            className="block rounded-2xl border border-transparent bg-white/70 px-4 py-3 text-sm leading-6 text-[color:var(--ink-2)] transition hover:border-[rgba(52,106,144,0.28)] hover:bg-white"
          >
            <span className="block text-xs uppercase tracking-[0.24em] text-[color:var(--signal-blue)]">
              {section.id}
            </span>
            <span className="mt-1 block">{section.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
