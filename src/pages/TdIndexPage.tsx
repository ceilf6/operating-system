import { FileSpreadsheet, TerminalSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { chapters, sandboxSpecs, tdPages } from "../lib/content";

export function TdIndexPage() {
  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">题单地图</div>
        <h1 className="page-title mt-4 text-5xl text-[color:var(--ink-1)]">按 TD 做题</h1>
        <p className="mt-5 max-w-4xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          每个 TD 独立成页，题目讲义、对应笔记、脚本实现和相关交互实验放在一起。做题时不用在章节、笔记和练习之间来回跳。
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {tdPages.map((td) => {
          const chapter = chapters.find((item) => item.slug === td.chapterSlug);
          return (
            <Link
              key={td.slug}
              to={`/tds/${td.slug}`}
              className="glass-card rounded-[32px] p-6 transition hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="eyebrow">{chapter ? `${chapter.number}. ${chapter.title}` : td.chapterSlug}</div>
                  <h2 className="page-title mt-4 text-3xl leading-tight text-[color:var(--ink-1)]">
                    {td.number}. {td.title}
                  </h2>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 text-sm text-[color:var(--ink-2)]">
                  <div className="rounded-[22px] border border-[rgba(15,31,49,0.1)] bg-white/75 px-4 py-3">
                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                      <FileSpreadsheet className="h-4 w-4" />
                      题目
                    </div>
                    <p className="mt-2 text-xl font-semibold text-[color:var(--ink-0)]">{td.questionMaterials.length}</p>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(15,31,49,0.1)] bg-white/75 px-4 py-3">
                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                      <TerminalSquare className="h-4 w-4" />
                      脚本
                    </div>
                    <p className="mt-2 text-xl font-semibold text-[color:var(--ink-0)]">{td.scriptMaterials.length}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-8 text-[color:var(--ink-2)]">{td.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {td.sandboxIds.length ? (
                  td.sandboxIds.map((sandboxId) => (
                    <span
                      key={sandboxId}
                      className="rounded-full border border-[rgba(46,125,91,0.14)] bg-[rgba(46,125,91,0.08)] px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--signal-green)]"
                    >
                      {sandboxSpecs.find((sandbox) => sandbox.id === sandboxId)?.title ?? "交互实验"}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-[rgba(15,31,49,0.1)] bg-white/75 px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--ink-2)]">
                    纯题目页
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
