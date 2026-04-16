import { BookOpenText, FolderGit2, ScrollText } from "lucide-react";
import { Outlet } from "react-router-dom";
import { TopNav } from "../navigation/TopNav";
import { chapters } from "../../lib/content";
import { getCoverageSummary } from "../../lib/sourceCoverage";

export function SiteShell() {
  const coverage = getCoverageSummary();

  return (
    <div className="app-shell">
      <TopNav />
      <div className="mx-auto flex w-full max-w-[1680px] gap-8 px-4 pb-16 pt-6 md:px-6 xl:px-8">
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="glass-card sticky top-24 rounded-[28px] p-5">
            <div className="eyebrow">Course Ledger</div>
            <h2 className="page-title mt-4 text-2xl text-[color:var(--ink-1)]">
              操作系统课程档案
            </h2>
            <div className="mt-6 space-y-3 text-sm text-[color:var(--ink-2)]">
              <div className="rounded-2xl border border-[color:var(--card-stroke)] bg-white/70 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <BookOpenText className="h-4 w-4" />
                  章节
                </div>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--ink-0)]">
                  {chapters.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--card-stroke)] bg-white/70 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <ScrollText className="h-4 w-4" />
                  覆盖率
                </div>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--signal-green)]">
                  {coverage.coveredPercent}%
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--card-stroke)] bg-white/70 p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
                  <FolderGit2 className="h-4 w-4" />
                  状态
                </div>
                <p className="mt-2 text-sm leading-7">
                  已覆盖 {coverage.coveredCount} 份资料，未覆盖 {coverage.pendingCount} 份。
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
