import type { ReactNode } from "react";

interface SandboxFrameProps {
  title: string;
  summary: string;
  conceptTargets: string[];
  limitations: string[];
  children: ReactNode;
}

export function SandboxFrame({
  title,
  summary,
  conceptTargets,
  limitations,
  children,
}: SandboxFrameProps) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[32px] p-6">
        <div className="eyebrow">Teaching Sandbox</div>
        <h1 className="page-title mt-4 text-4xl text-[color:var(--ink-1)]">{title}</h1>
        <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          {summary}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[rgba(46,125,91,0.14)] bg-[rgba(46,125,91,0.08)] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-green)]">
              模拟了什么
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--ink-1)]">
              {conceptTargets.map((target) => (
                <li key={target}>• {target}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-[rgba(141,74,60,0.14)] bg-[rgba(141,74,60,0.08)] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-red)]">
              没模拟什么
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-[color:var(--ink-1)]">
              {limitations.map((target) => (
                <li key={target}>• {target}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="glass-card rounded-[32px] p-6">{children}</div>
    </div>
  );
}
