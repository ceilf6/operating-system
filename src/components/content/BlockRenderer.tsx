import { AlertTriangle, DraftingCompass, LibraryBig, Pointer, Waypoints } from "lucide-react";
import { Link } from "react-router-dom";
import { LearningBlock, sandboxSpecs } from "../../lib/content";
import { SourceDrawer } from "./SourceDrawer";

interface BlockRendererProps {
  block: LearningBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "overview":
      return (
        <div className="section-frame rounded-[28px] px-5 py-5 text-[color:var(--ink-1)]">
          <div className="eyebrow">本节先看</div>
          <p className="mt-4 text-[1.02rem] leading-8">{block.content}</p>
        </div>
      );
    case "key-points":
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {block.items.map((item, index) => (
            <article key={item} className="glass-card rounded-[24px] p-5">
              <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
                <Pointer className="h-4 w-4" />
                核心点 {index + 1}
              </div>
              <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--ink-1)]">{item}</p>
            </article>
          ))}
        </div>
      );
    case "callout":
      return (
        <div className="rounded-[28px] border border-[rgba(141,74,60,0.15)] bg-[rgba(141,74,60,0.07)] p-5 text-[color:var(--ink-1)]">
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-red)]">
            <AlertTriangle className="h-4 w-4" />
            {block.title}
          </div>
          <p className="mt-4 text-[0.98rem] leading-8">{block.content}</p>
        </div>
      );
    case "diagram-list":
      return (
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-green)]">
            <DraftingCompass className="h-4 w-4" />
            图解线索
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {block.items.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-[rgba(46,125,91,0.14)] bg-[rgba(46,125,91,0.08)] p-4 text-sm leading-7 text-[color:var(--ink-1)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    case "exercise-list":
      return (
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-orange)]">
            <LibraryBig className="h-4 w-4" />
            练习 / 思考题
          </div>
          <div className="mt-4 space-y-4">
            {block.items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-[rgba(192,109,44,0.16)] bg-[rgba(255,245,236,0.82)] px-4 py-4"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--signal-orange)]">
                  练习 {index + 1}
                </div>
                <p className="mt-2 text-[0.98rem] leading-8 text-[color:var(--ink-1)]">{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "source-pack":
      return (
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
            <LibraryBig className="h-4 w-4" />
            原讲义节选与题目材料
          </div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">
            如果你想对照老师原始表述、回看题目设置或核对例子，再展开下面的材料。
          </p>
          <div className="mt-4 space-y-4">
            {block.items.map((item) => (
              <SourceDrawer key={item.sourceId} item={item} />
            ))}
          </div>
        </div>
      );
    case "sandbox-links":
      return (
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
            <Waypoints className="h-4 w-4" />
            相关交互实验
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {block.ids.map((id) => {
              const sandbox = sandboxSpecs.find((item) => item.id === id);
              if (!sandbox) {
                return null;
              }
              return (
                <Link
                  key={id}
                  to={`/practice/${sandbox.slug}`}
                  className="rounded-full border border-[rgba(52,106,144,0.18)] bg-white/85 px-4 py-2 text-sm text-[color:var(--ink-1)] transition hover:border-[rgba(52,106,144,0.32)] hover:bg-white"
                >
                  {sandbox.title}
                </Link>
              );
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
}
