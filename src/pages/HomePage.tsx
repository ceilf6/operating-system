import { ArrowRight, Compass, Layers3, MonitorCog, Route, Sigma } from "lucide-react";
import { Link } from "react-router-dom";
import { chapters, getStats, sandboxSpecs } from "../lib/content";
import { getCoverageSummary } from "../lib/sourceCoverage";

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
  const coverage = getCoverageSummary();
  const featuredSandboxes = sandboxSpecs.slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="glass-card overflow-hidden rounded-[40px] p-6 md:p-8 xl:p-10">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="eyebrow">Machine Room Blueprint × Archive Atlas</div>
            <h1 className="page-title mt-6 max-w-4xl text-5xl leading-tight text-[color:var(--ink-1)] md:text-6xl">
              用一座中文教学网站，把散落的操作系统资料重组为可学习的课程地图。
            </h1>
            <p className="mt-6 max-w-3xl text-[1.06rem] leading-9 text-[color:var(--ink-2)]">
              这里不是资料归档页，而是把 `base-files/`、`notes/`、`sandbox/`、课程项目和教师补充素材压成一条能连续学习、连续复习、连续实践的学习路径。
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
                内容规模
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink-0)]">{stats.chapterCount}</p>
                  <p className="text-sm text-[color:var(--ink-2)]">章节</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-[color:var(--ink-0)]">{stats.sourceCount}</p>
                  <p className="text-sm text-[color:var(--ink-2)]">资料源</p>
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
                覆盖状态
              </div>
              <p className="mt-4 text-4xl font-semibold text-[color:var(--signal-green)]">
                {coverage.coveredPercent}%
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--ink-1)]">
                {coverage.coveredCount} 份资料已进入课程映射，剩余 {coverage.pendingCount} 份等待补充。
              </p>
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

      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">Chapter Atlas</div>
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
                {chapter.sections.length} 个主题段落 / {chapter.sourceIds.length} 份来源
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Interactive Labs</div>
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
