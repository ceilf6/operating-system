import { BookOpenText, FolderGit2, ScrollText } from "lucide-react";
import { Outlet } from "react-router-dom";
import { TopNav } from "../navigation/TopNav";
import { chapters, sandboxSpecs } from "../../lib/content";

export function SiteShell() {
  return (
    <div className="app-shell">
      <TopNav />
      <div className="mx-auto flex w-full max-w-[1680px] gap-8 px-4 pb-16 pt-6 md:px-6 xl:px-8">
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="glass-card sticky top-24 rounded-[28px] p-5">
            <div className="eyebrow">Study Rail</div>
            <h2 className="page-title mt-4 text-2xl text-[color:var(--ink-1)]">
              操作系统学习导航
            </h2>
            <div className="mt-6 space-y-3 text-sm text-[color:var(--ink-2)]">
              <div className="rounded-2xl border border-[color:var(--card-stroke)] bg-white/70 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <BookOpenText className="h-4 w-4" />
                  课程章节
                </div>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--ink-0)]">
                  {chapters.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--card-stroke)] bg-white/70 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <ScrollText className="h-4 w-4" />
                  交互实验
                </div>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--signal-green)]">{sandboxSpecs.length}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--card-stroke)] bg-white/70 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <FolderGit2 className="h-4 w-4" />
                  建议顺序
                </div>
                <p className="mt-2 text-sm leading-7">
                  先学第 1-9 章实操，再学第 10-12 章理论，最后回到复习页和项目页做综合巩固。
                </p>
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
