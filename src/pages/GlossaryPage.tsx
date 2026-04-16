import { useState } from "react";
import { chapters, glossaryEntries } from "../lib/content";

export function GlossaryPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = glossaryEntries.filter((entry) => {
    if (!normalizedQuery) {
      return true;
    }
    return [entry.term, entry.definition, entry.chapterSlug]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">Glossary</div>
        <h1 className="page-title mt-4 text-5xl text-[color:var(--ink-1)]">术语总表</h1>
        <p className="mt-5 max-w-3xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          用于复习章节之间反复出现的核心概念，避免在 Linux 实操线和操作系统理论线之间来回跳时丢词。
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索术语，例如 inode / MMU / syslog"
          className="mt-6 w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white/80 px-4 py-3 outline-none transition focus:border-[rgba(52,106,144,0.32)]"
        />
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((entry) => (
          <article key={entry.id} className="glass-card rounded-[28px] p-5">
            <div className="eyebrow">
              {chapters.find((chapter) => chapter.slug === entry.chapterSlug)?.title ?? entry.chapterSlug}
            </div>
            <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">{entry.term}</h2>
            <p className="mt-4 text-sm leading-8 text-[color:var(--ink-2)]">{entry.definition}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
