import { Link, useParams } from "react-router-dom";
import { AnchorNav } from "../components/navigation/AnchorNav";
import { SectionPanel } from "../components/content/SectionPanel";
import { getChapterBySlug, getNotePagesForChapter, getTdPagesForChapter } from "../lib/content";

export function ChapterPage() {
  const { chapterSlug } = useParams();
  const chapter = getChapterBySlug(chapterSlug);
  const relatedNotes = chapter ? getNotePagesForChapter(chapter.slug) : [];
  const relatedTds = chapter ? getTdPagesForChapter(chapter.slug) : [];

  if (!chapter) {
    return (
      <div className="glass-card rounded-[32px] p-8">
        <h1 className="page-title text-4xl text-[color:var(--ink-1)]">章节不存在</h1>
        <p className="mt-4 text-[color:var(--ink-2)]">请从课程总览重新进入。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_290px]">
      <div className="space-y-8">
        <section className="glass-card rounded-[40px] p-6 md:p-8">
          <div className="eyebrow">{chapter.track}</div>
          <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-5xl font-semibold text-[color:var(--signal-blue)]">{chapter.number}</p>
              <h1 className="page-title mt-4 text-5xl leading-tight text-[color:var(--ink-1)]">
                {chapter.title}
              </h1>
            </div>
            <div className="rounded-[28px] border border-[rgba(15,31,49,0.1)] bg-white/70 px-5 py-4 text-sm leading-7 text-[color:var(--ink-2)]">
              <p>{chapter.summary}</p>
              <p className="mt-2">
                {chapter.sandboxIds.length > 0
                  ? `本章包含 ${chapter.sections.length} 个主题段落，并配有 ${chapter.sandboxIds.length} 个相关实验。`
                  : `本章包含 ${chapter.sections.length} 个主题段落，适合先顺着概念主线读完再做题。`}
              </p>
            </div>
          </div>
        </section>

        {relatedNotes.length || relatedTds.length ? (
          <section className="grid gap-4 xl:grid-cols-2">
            <article className="glass-card rounded-[32px] p-6">
              <div className="eyebrow">对应笔记</div>
              <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">本章相关笔记</h2>
              <div className="mt-5 space-y-3">
                {relatedNotes.map((note) => (
                  <Link
                    key={note.slug}
                    to={`/notes/${note.slug}`}
                    className="block rounded-[22px] border border-[rgba(15,31,49,0.1)] bg-white/75 px-4 py-4 text-sm leading-7 text-[color:var(--ink-1)] transition hover:bg-white"
                  >
                    {note.title}
                  </Link>
                ))}
              </div>
            </article>
            <article className="glass-card rounded-[32px] p-6">
              <div className="eyebrow">对应题单</div>
              <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">本章对应题单</h2>
              <div className="mt-5 space-y-3">
                {relatedTds.length ? (
                  relatedTds.map((td) => (
                    <Link
                      key={td.slug}
                      to={`/tds/${td.slug}`}
                      className="block rounded-[22px] border border-[rgba(192,109,44,0.14)] bg-[rgba(255,245,236,0.82)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-1)] transition hover:bg-white"
                    >
                      {td.number}. {td.title}
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-[rgba(15,31,49,0.14)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-2)]">
                    当前这一章没有单独 TD 页，适合直接顺着章节和笔记阅读。
                  </div>
                )}
              </div>
            </article>
          </section>
        ) : null}

        {chapter.sections.map((section) => (
          <SectionPanel key={section.id} section={section} />
        ))}

        <section className="glass-card rounded-[32px] p-6">
          <div className="eyebrow">继续学习</div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {chapter.previousSlug ? (
              <Link
                to={`/course/${chapter.previousSlug}`}
                className="rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/70 p-5 text-sm leading-7 text-[color:var(--ink-2)] transition hover:bg-white"
              >
                ← 返回上一章
              </Link>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[rgba(15,31,49,0.1)] p-5 text-sm text-[color:var(--ink-2)]">
                这是课程起点。
              </div>
            )}
            {chapter.nextSlug ? (
              <Link
                to={`/course/${chapter.nextSlug}`}
                className="rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/70 p-5 text-right text-sm leading-7 text-[color:var(--ink-2)] transition hover:bg-white"
              >
                继续下一章 →
              </Link>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[rgba(15,31,49,0.1)] p-5 text-right text-sm text-[color:var(--ink-2)]">
                这是当前课程地图的终章。
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="hidden xl:block">
        <AnchorNav sections={chapter.sections} />
      </aside>
    </div>
  );
}
