import { Link } from "react-router-dom";
import { sandboxSpecs } from "../lib/content";

export function PracticeHubPage() {
  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">Practice Hub</div>
        <h1 className="page-title mt-4 text-5xl text-[color:var(--ink-1)]">实践与教学沙箱</h1>
        <p className="mt-5 max-w-3xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          每个沙箱都只模拟课程概念，不伪装成真实系统。重点是帮助你看见输入、状态变化、算法决策和边界。
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sandboxSpecs.map((sandbox) => (
          <Link
            key={sandbox.id}
            to={`/practice/${sandbox.slug}`}
            className="glass-card rounded-[32px] p-6 transition hover:-translate-y-0.5"
          >
            <div className="eyebrow">{sandbox.conceptTargets.join(" / ")}</div>
            <h2 className="page-title mt-5 text-3xl leading-tight text-[color:var(--ink-1)]">
              {sandbox.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-2)]">{sandbox.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {sandbox.chapterSlugs.map((slug) => (
                <span
                  key={slug}
                  className="rounded-full border border-[rgba(15,31,49,0.1)] bg-white/75 px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--ink-2)]"
                >
                  {slug}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
