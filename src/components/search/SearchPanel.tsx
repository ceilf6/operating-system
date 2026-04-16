import clsx from "clsx";
import { SearchRecord } from "../../lib/content";

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  kind: SearchRecord["kind"] | "all";
  onKindChange: (value: SearchRecord["kind"] | "all") => void;
}

const filters: Array<SearchRecord["kind"] | "all"> = ["all", "section", "glossary", "sandbox"];

export function SearchPanel({
  query,
  onQueryChange,
  kind,
  onKindChange,
}: SearchPanelProps) {
  return (
    <div className="glass-card rounded-[28px] p-5">
      <div className="eyebrow">Index Search</div>
      <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">站内搜索</h2>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">关键词</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="试试 syslog / FIFO / which / banker / syncfs"
            className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white/85 px-4 py-3 outline-none transition focus:border-[rgba(52,106,144,0.36)]"
          />
        </label>
        <div>
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">类型</span>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onKindChange(item)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm transition",
                  kind === item
                    ? "bg-[color:var(--ink-0)] text-white"
                    : "border border-[rgba(15,31,49,0.1)] bg-white/70 text-[color:var(--ink-2)] hover:bg-white",
                )}
              >
                {item === "all" ? "全部" : item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
