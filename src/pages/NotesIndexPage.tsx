import { BookOpenText, FileStack } from "lucide-react";
import { Link } from "react-router-dom";
import { chapters, notePages } from "../lib/content";

export function NotesIndexPage() {
  const groupedNotes = chapters
    .map((chapter) => ({
      chapter,
      items: notePages.filter((note) => note.primaryChapterSlug === chapter.slug),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">笔记地图</div>
        <h1 className="page-title mt-4 text-5xl text-[color:var(--ink-1)]">按笔记读课程</h1>
        <p className="mt-5 max-w-4xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          这里把每一份课堂笔记单独展开成页面。你可以按章节回看中文整理，也可以顺着相关题单和练习脚本继续往下钻。
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-[color:var(--ink-2)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,31,49,0.12)] bg-white/70 px-4 py-2">
            <BookOpenText className="h-4 w-4" />
            {notePages.length} 份笔记
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,31,49,0.12)] bg-white/70 px-4 py-2">
            <FileStack className="h-4 w-4" />
            每份笔记都能跳到相关讲义、脚本和 TD
          </span>
        </div>
      </section>

      {groupedNotes.map(({ chapter, items }) => (
        <section key={chapter.slug} className="glass-card rounded-[36px] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">{chapter.track}</div>
              <h2 className="page-title mt-4 text-4xl text-[color:var(--ink-1)]">
                {chapter.number}. {chapter.title}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--ink-2)]">{chapter.summary}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((note) => (
              <Link
                key={note.id}
                to={`/notes/${note.slug}`}
                className="rounded-[28px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5 transition hover:-translate-y-0.5 hover:border-[rgba(52,106,144,0.25)]"
              >
                <div className="eyebrow">笔记 {note.slug.toUpperCase()}</div>
                <h3 className="page-title mt-4 text-2xl leading-snug text-[color:var(--ink-1)]">{note.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">{note.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.relatedTdSlugs.length ? (
                    <span className="rounded-full border border-[rgba(192,109,44,0.14)] bg-[rgba(255,245,236,0.82)] px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--signal-orange)]">
                      关联 {note.relatedTdSlugs.length} 个题单
                    </span>
                  ) : null}
                  {note.scriptMaterials.length ? (
                    <span className="rounded-full border border-[rgba(46,125,91,0.14)] bg-[rgba(46,125,91,0.08)] px-3 py-1 text-xs tracking-[0.18em] text-[color:var(--signal-green)]">
                      {note.scriptMaterials.length} 份脚本
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
