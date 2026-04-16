import { chapters } from "../lib/content";

export function ReviewPage() {
  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">Review Console</div>
        <h1 className="page-title mt-4 text-5xl text-[color:var(--ink-1)]">复习与回顾</h1>
        <p className="mt-5 max-w-3xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          每一章都抽出最值得二次确认的 checklist、易错点和图解建议，方便考前或做题前快速扫一遍。
        </p>
      </section>
      <div className="space-y-5">
        {chapters.map((chapter) => (
          <details key={chapter.slug} className="glass-card rounded-[32px] p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="eyebrow">{chapter.track}</div>
                  <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">
                    {chapter.number}. {chapter.title}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-[color:var(--ink-2)]">{chapter.summary}</p>
              </div>
            </summary>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <article className="rounded-[24px] border border-[rgba(46,125,91,0.14)] bg-[rgba(46,125,91,0.08)] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-green)]">
                  Checklist
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--ink-1)]">
                  {chapter.review.checklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-[24px] border border-[rgba(141,74,60,0.14)] bg-[rgba(141,74,60,0.08)] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-red)]">
                  易错点
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--ink-1)]">
                  {chapter.review.pitfalls.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-[24px] border border-[rgba(52,106,144,0.14)] bg-[rgba(52,106,144,0.08)] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">
                  图解提示
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--ink-1)]">
                  {chapter.review.diagramIdeas.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
