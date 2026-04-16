import { BlockRenderer } from "./BlockRenderer";
import { CourseSection, getGlossaryByIds } from "../../lib/content";

interface SectionPanelProps {
  section: CourseSection;
}

export function SectionPanel({ section }: SectionPanelProps) {
  const glossaryEntries = getGlossaryByIds(section.glossaryIds);

  return (
    <section id={section.anchor} className="scroll-mt-28 space-y-5">
      <header className="blueprint-rule pb-4">
        <div className="eyebrow">{section.id}</div>
        <h2 className="page-title mt-4 text-4xl text-[color:var(--ink-1)]">{section.title}</h2>
        {glossaryEntries.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {glossaryEntries.map((entry) => (
              <span
                key={entry.id}
                className="rounded-full border border-[rgba(15,31,49,0.1)] bg-white/70 px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--ink-2)]"
              >
                {entry.term}
              </span>
            ))}
          </div>
        ) : null}
      </header>
      {section.blocks.map((block, index) => (
        <BlockRenderer key={`${section.id}-${block.type}-${index}`} block={block} />
      ))}
    </section>
  );
}
