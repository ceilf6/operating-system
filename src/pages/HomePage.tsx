import { ArrowRight, BookOpenText, Compass, Layers3, MonitorCog, Route, Sigma } from "lucide-react";
import { Link } from "react-router-dom";
import { chapters, getStats, notePages, sandboxSpecs, tdPages } from "../lib/content";

const trackDescriptions = [
  {
    title: "Linux / Unix 实操线",
    icon: MonitorCog,
    body: "从 Shell、文件系统、权限、文本处理、日志、挂载和系统管理脚本一路推进，适合先把命令和环境跑通。",
  },
  {
    title: "操作系统理论线",
    icon: Sigma,
    body: "围绕内核、进程、内存、分页、同步、死锁、调度与课程项目建立完整理论框架。",
  },
];

export function HomePage() {
  const stats = getStats();
  const featuredSandboxes = sandboxSpecs.slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="glass-card overflow-hidden rounded-[40px] p-6 md:p-8 xl:p-10">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="eyebrow">机房蓝图 × 学习地图</div>
            <h1 className="page-title mt-6 max-w-4xl text-5xl leading-tight text-[color:var(--ink-1)] md:text-6xl">
              给正在学操作系统的你，一张能一路学到项目实战的课程地图。
            </h1>
            <p className="mt-6 max-w-3xl text-[1.06rem] leading-9 text-[color:var(--ink-2)]">
              内容按章节、笔记、题单、术语和交互实验组织。先把 Linux 命令、文件系统和系统管理跑通，再进入进程、内存、同步与调度，最后回到 SyncFS 综合实践闭环。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/course/${chapters[0]?.slug ?? ""}`}
                className="flex items-center gap-2 rounded-full bg-[color:var(--ink-0)] px-5 py-3 text-sm text-white transition hover:bg-[color:var(--ink-1)]"
              >
                从第一章开始
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/practice"
                className="rounded-full border border-[rgba(15,31,49,0.12)] bg-white/75 px-5 py-3 text-sm text-[color:var(--ink-1)] transition hover:bg-white"
              >
                直接进入沙箱实验
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[28px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">
                <Layers3 className="h-4 w-4" />
                学习地图
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink-0)]">{stats.chapterCount}</p>
                  <p className="text-sm text-[color:var(--ink-2)]">课程章节</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink-0)]">2</p>
                  <p className="text-sm text-[color:var(--ink-2)]">学习主线</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink-0)]">{stats.sandboxCount}</p>
                  <p className="text-sm text-[color:var(--ink-2)]">交互沙箱</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink-0)]">{stats.glossaryCount}</p>
                  <p className="text-sm text-[color:var(--ink-2)]">术语条目</p>
                </div>
              </div>
            </article>
            <article className="rounded-[28px] border border-[rgba(46,125,91,0.14)] bg-[rgba(46,125,91,0.08)] p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--signal-green)]">
                <Compass className="h-4 w-4" />
                推荐节奏
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-1)]">
                <p>第 1-9 章先把命令行、文本处理、日志和系统管理的手感建立起来。</p>
                <p>第 10-12 章再进入进程、分页、同步、死锁和调度，会更容易把抽象概念落地。</p>
                <p>做完一章就去沙箱推演，考前回到复习页快速扫核心点和易错点。</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {trackDescriptions.map((track) => {
          const Icon = track.icon;
          return (
            <article key={track.title} className="glass-card rounded-[32px] p-6">
              <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
                <Icon className="h-5 w-5" />
                双主线结构
              </div>
              <h2 className="page-title mt-5 text-3xl text-[color:var(--ink-1)]">{track.title}</h2>
              <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--ink-2)]">{track.body}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Link
          to="/notes"
          className="glass-card rounded-[32px] p-6 transition hover:-translate-y-0.5 hover:border-[rgba(52,106,144,0.25)]"
        >
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
            <BookOpenText className="h-5 w-5" />
            按笔记逐份读
          </div>
          <h2 className="page-title mt-5 text-3xl text-[color:var(--ink-1)]">
            {stats.noteCount} 份笔记独立展开
          </h2>
          <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--ink-2)]">
            每份课堂笔记都有单独页面，适合顺着中文整理把概念吃透，再回看配套讲义和练习脚本。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {notePages.slice(0, 4).map((note) => (
              <span
                key={note.slug}
                className="rounded-full border border-[rgba(15,31,49,0.1)] bg-white/75 px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--ink-2)]"
              >
                {note.title}
              </span>
            ))}
          </div>
        </Link>
        <Link
          to="/tds"
          className="glass-card rounded-[32px] p-6 transition hover:-translate-y-0.5 hover:border-[rgba(192,109,44,0.24)]"
        >
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-orange)]">
            <Layers3 className="h-5 w-5" />
            按 TD 集中做题
          </div>
          <h2 className="page-title mt-5 text-3xl text-[color:var(--ink-1)]">
            {stats.tdCount} 个 TD 页面一页到底
          </h2>
          <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--ink-2)]">
            每个 TD 都把题目原文、对应笔记和配套脚本并排放好，做题时不用自己找对应关系。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {tdPages.slice(0, 4).map((td) => (
              <span
                key={td.slug}
                className="rounded-full border border-[rgba(192,109,44,0.14)] bg-[rgba(255,245,236,0.82)] px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--signal-orange)]"
              >
                {td.title}
              </span>
            ))}
          </div>
        </Link>
      </section>

      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">章节地图</div>
            <h2 className="page-title mt-4 text-4xl text-[color:var(--ink-1)]">课程章节地图</h2>
          </div>
          <Link to="/review" className="text-sm text-[color:var(--signal-blue)]">
            前往复习面板 →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              to={`/course/${chapter.slug}`}
              className="rounded-[28px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-[rgba(52,106,144,0.25)]"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="eyebrow">{chapter.track}</span>
                <span className="text-3xl font-semibold text-[color:var(--signal-blue)]">{chapter.number}</span>
              </div>
              <h3 className="page-title mt-5 text-3xl leading-snug text-[color:var(--ink-1)]">{chapter.title}</h3>
              <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--ink-2)]">{chapter.summary}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[color:var(--ink-2)]">
                <Route className="h-4 w-4" />
                {chapter.sections.length} 个主题段落
                {chapter.sandboxIds.length > 0
                  ? ` / ${chapter.sandboxIds.length} 个相关实验`
                  : " / 适合先通读再做题"}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow">交互实验</div>
            <h2 className="page-title mt-4 text-4xl text-[color:var(--ink-1)]">沙箱与推演</h2>
          </div>
          <Link to="/practice" className="text-sm text-[color:var(--signal-blue)]">
            查看全部 →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredSandboxes.map((sandbox) => (
            <Link
              key={sandbox.id}
              to={`/practice/${sandbox.slug}`}
              className="rounded-[28px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-[rgba(46,125,91,0.25)]"
            >
              <div className="eyebrow">{sandbox.conceptTargets.slice(0, 2).join(" / ")}</div>
              <h3 className="page-title mt-4 text-2xl text-[color:var(--ink-1)]">{sandbox.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">{sandbox.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
