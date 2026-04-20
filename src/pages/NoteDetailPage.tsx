import { Link, useParams } from "react-router-dom";
import { PageCallout } from "../components/community/PageCallout";
import { MarkdownArticle } from "../components/content/MarkdownArticle";
import { SourcePackSection } from "../components/content/SourcePackSection";
import { MarkdownTocNav } from "../components/navigation/MarkdownTocNav";
import {
  chapters,
  getNotePageBySlug,
  sandboxSpecs,
  tdPages,
} from "../lib/content";
import { getAnnouncementsForPlacement } from "../lib/community";

export function NoteDetailPage() {
  const { noteSlug } = useParams();
  const note = getNotePageBySlug(noteSlug);

  if (!note) {
    return (
      <div className="glass-card rounded-[32px] p-8">
        <h1 className="page-title text-4xl text-[color:var(--ink-1)]">笔记不存在</h1>
        <p className="mt-4 text-[color:var(--ink-2)]">请从笔记索引重新进入。</p>
      </div>
    );
  }

  const relatedChapters = chapters.filter((chapter) => note.chapterSlugs.includes(chapter.slug));
  const relatedTds = tdPages.filter((td) => note.relatedTdSlugs.includes(td.slug));
  const relatedSandboxes = sandboxSpecs.filter((sandbox) => note.relatedSandboxIds.includes(sandbox.id));
  const tocGroups = [{ id: note.slug, title: note.title, items: note.headings }];
  const pageCallouts = getAnnouncementsForPlacement("page-callout", {
    pathname: `/notes/${note.slug}`,
    noteSlug: note.slug,
    pageTitle: note.title,
  });

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">课堂笔记</div>
        <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--signal-blue)]">
              笔记 {note.slug.toUpperCase()}
            </p>
            <h1 className="page-title mt-3 text-5xl leading-tight text-[color:var(--ink-1)]">
              {note.title}
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--ink-2)]">{note.summary}</p>
        </div>
      </section>

      {pageCallouts.map((announcement) => (
        <PageCallout
          key={announcement.id}
          announcement={announcement}
          context={{
            pathname: `/notes/${note.slug}`,
            noteSlug: note.slug,
            pageTitle: note.title,
          }}
        />
      ))}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="glass-card rounded-[32px] p-6 md:p-8">
            <div className="eyebrow">完整笔记</div>
            <div className="mt-6">
              <MarkdownArticle content={note.content} />
            </div>
          </section>

          <SourcePackSection
            eyebrow="配套材料"
            title="相关讲义与原题材料"
            description="这一栏放和当前笔记直接对应的课件、题单、翻译稿或题目原文，方便你来回核对。"
            items={note.baseMaterials}
            emptyMessage="这份笔记当前没有额外挂载独立讲义，直接读完整笔记即可。"
          />

          <SourcePackSection
            eyebrow="配套脚本"
            title="相关脚本与命令示例"
            description="这里收对应的练习脚本。适合在看完笔记之后直接对照脚本跑一遍。"
            items={note.scriptMaterials}
            emptyMessage="这份笔记当前没有独立脚本包，优先看章节页或对应 TD 页里的练习。"
          />
        </div>

        <aside className="sticky top-24 self-start space-y-4 overflow-auto pr-1 xl:max-h-[calc(100vh-7rem)]">
          <MarkdownTocNav eyebrow="本页目录" title="笔记标题跳转" groups={tocGroups} />

          <section className="glass-card rounded-[28px] p-5">
            <div className="eyebrow">对应章节</div>
            <div className="mt-4 space-y-3">
              {relatedChapters.map((chapter) => (
                <Link
                  key={chapter.slug}
                  to={`/course/${chapter.slug}`}
                  className="block rounded-[22px] border border-[rgba(15,31,49,0.1)] bg-white/75 px-4 py-4 text-sm leading-7 text-[color:var(--ink-1)] transition hover:bg-white"
                >
                  {chapter.number}. {chapter.title}
                </Link>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-[28px] p-5">
            <div className="eyebrow">对应题单</div>
            <div className="mt-4 space-y-3">
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
                  这份笔记更偏课程讲解，没有单独题单页与它绑定。
                </div>
              )}
            </div>
          </section>

          <section className="glass-card rounded-[28px] p-5">
            <div className="eyebrow">相关实验</div>
            <div className="mt-4 space-y-3">
              {relatedSandboxes.length ? (
                relatedSandboxes.map((sandbox) => (
                  <Link
                    key={sandbox.slug}
                    to={`/practice/${sandbox.slug}`}
                    className="block rounded-[22px] border border-[rgba(52,106,144,0.14)] bg-white/75 px-4 py-4 text-sm leading-7 text-[color:var(--ink-1)] transition hover:bg-white"
                  >
                    {sandbox.title}
                  </Link>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[rgba(15,31,49,0.14)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-2)]">
                  当前没有绑定交互实验，适合直接顺着笔记和原题读。
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
