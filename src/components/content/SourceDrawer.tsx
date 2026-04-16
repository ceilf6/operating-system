import { FileCode2, FileText, FolderKanban, RadioTower } from "lucide-react";
import { SourceCard } from "../../lib/content";
import { MarkdownArticle } from "./MarkdownArticle";

interface SourceDrawerProps {
  item: SourceCard;
}

function kindLabel(kind: SourceCard["kind"]) {
  switch (kind) {
    case "sandbox":
      return { label: "脚本沙箱", icon: FolderKanban };
    case "project":
      return { label: "课程项目", icon: RadioTower };
    case "pdf":
    case "docx":
    case "pptx":
      return { label: kind.toUpperCase(), icon: FileText };
    default:
      return { label: "笔记 / 讲义", icon: FileCode2 };
  }
}

export function SourceDrawer({ item }: SourceDrawerProps) {
  const kind = kindLabel(item.kind);
  const Icon = kind.icon;

  return (
    <details className="group rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5 shadow-sm transition open:shadow-md">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">
            <Icon className="h-4 w-4" />
            {kind.label}
            <span className="rounded-full bg-[rgba(15,31,49,0.06)] px-2 py-1 text-[10px] tracking-[0.18em] text-[color:var(--ink-2)]">
              {item.language}
            </span>
          </div>
          <h4 className="page-title mt-3 text-2xl text-[color:var(--ink-1)]">{item.title}</h4>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">{item.path}</p>
          {item.excerpt ? (
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-2)]">{item.excerpt}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-[rgba(15,31,49,0.08)] px-3 py-1 text-xs text-[color:var(--ink-2)] transition group-open:bg-[color:var(--ink-0)] group-open:text-white">
          展开资料
        </span>
      </summary>
      <div className="mt-6 rounded-[24px] border border-[rgba(15,31,49,0.08)] bg-[rgba(246,238,224,0.55)] p-5">
        <MarkdownArticle content={item.content} />
      </div>
    </details>
  );
}
