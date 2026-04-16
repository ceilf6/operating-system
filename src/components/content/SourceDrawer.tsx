import { FileCode2, FileText, FolderKanban, RadioTower } from "lucide-react";
import { SourceCard } from "../../lib/content";
import { MarkdownArticle } from "./MarkdownArticle";

interface SourceDrawerProps {
  item: SourceCard;
}

function languageLabel(language: SourceCard["language"]) {
  switch (language) {
    case "zh":
      return "中文";
    case "fr":
      return "法语";
    default:
      return "中法混合";
  }
}

function kindLabel(kind: SourceCard["kind"]) {
  switch (kind) {
    case "sandbox":
      return { label: "示例脚本", icon: FolderKanban };
    case "project":
      return { label: "项目材料", icon: RadioTower };
    case "pdf":
    case "docx":
    case "pptx":
      return { label: "原讲义节选", icon: FileText };
    default:
      return { label: "笔记与讲义", icon: FileCode2 };
  }
}

export function SourceDrawer({ item }: SourceDrawerProps) {
  const kind = kindLabel(item.kind);
  const Icon = kind.icon;
  const shouldShowExcerpt = item.kind !== "sandbox";

  return (
    <details className="group rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5 shadow-sm transition open:shadow-md">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">
            <Icon className="h-4 w-4" />
            {kind.label}
            <span className="rounded-full bg-[rgba(15,31,49,0.06)] px-2 py-1 text-[10px] tracking-[0.18em] text-[color:var(--ink-2)]">
              {languageLabel(item.language)}
            </span>
          </div>
          <h4 className="page-title mt-3 text-2xl text-[color:var(--ink-1)]">{item.title}</h4>
          {shouldShowExcerpt && item.excerpt ? (
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">{item.excerpt}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-[rgba(15,31,49,0.08)] px-3 py-1 text-xs text-[color:var(--ink-2)] transition group-open:bg-[color:var(--ink-0)] group-open:text-white">
          查看节选
        </span>
      </summary>
      <div className="mt-6 rounded-[24px] border border-[rgba(15,31,49,0.08)] bg-[rgba(246,238,224,0.55)] p-5">
        <MarkdownArticle content={item.content} />
      </div>
    </details>
  );
}
