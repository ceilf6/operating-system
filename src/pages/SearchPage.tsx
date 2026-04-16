import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { SearchPanel } from "../components/search/SearchPanel";
import { SearchRecord, chapters } from "../lib/content";
import { querySearchRecords } from "../lib/search";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchRecord["kind"] | "all">("all");
  const deferredQuery = useDeferredValue(query);
  const results = querySearchRecords(deferredQuery, { kind });

  return (
    <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
      <SearchPanel query={query} onQueryChange={setQuery} kind={kind} onKindChange={setKind} />
      <section className="space-y-4">
        <div className="glass-card rounded-[32px] p-6">
          <div className="eyebrow">Indexed Routes</div>
          <h1 className="page-title mt-4 text-4xl text-[color:var(--ink-1)]">搜索结果</h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">
            当前覆盖 {chapters.length} 个章节与多类内容索引，共命中 {results.length} 条。
          </p>
        </div>
        {results.map((record) => (
          <Link key={record.id} to={record.route} className="glass-card block rounded-[28px] p-5 transition hover:-translate-y-0.5">
            <div className="eyebrow">{record.kind}</div>
            <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">{record.title}</h2>
            <p className="mt-3 text-sm leading-8 text-[color:var(--ink-2)]">{record.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {record.keywords.slice(0, 6).map((keyword) => (
                <span
                  key={`${record.id}-${keyword}`}
                  className="rounded-full border border-[rgba(15,31,49,0.1)] bg-white/75 px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--ink-2)]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
