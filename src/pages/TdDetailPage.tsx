import { Link, useParams } from "react-router-dom";
import { PageCallout } from "../components/community/PageCallout";
import { MarkdownArticle } from "../components/content/MarkdownArticle";
import { SourcePackSection } from "../components/content/SourcePackSection";
import { MarkdownTocNav } from "../components/navigation/MarkdownTocNav";
import { chapters, getTdPageBySlug, sandboxSpecs } from "../lib/content";
import { getAnnouncementsForPlacement } from "../lib/community";

export function TdDetailPage() {
  const { tdSlug } = useParams();
  const td = getTdPageBySlug(tdSlug);

  if (!td) {
    return (
      <div className="glass-card rounded-[32px] p-8">
        <h1 className="page-title text-4xl text-[color:var(--ink-1)]">TD 不存在</h1>
        <p className="mt-4 text-[color:var(--ink-2)]">请从 TD 索引重新进入。</p>
      </div>
    );
  }

  const chapter = chapters.find((item) => item.slug === td.chapterSlug);
  const relatedSandboxes = sandboxSpecs.filter((sandbox) => td.sandboxIds.includes(sandbox.id));
  const tocGroups = td.noteEntries.map((note) => ({
    id: note.slug,
    title: note.title,
    items: note.headings,
  }));
  const pageCallouts = getAnnouncementsForPlacement("page-callout", {
    pathname: `/tds/${td.slug}`,
    tdSlug: td.slug,
    pageTitle: td.title,
  });

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">题单练习页</div>
        <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--signal-orange)]">TD {td.number}</p>
            <h1 className="page-title mt-3 text-5xl leading-tight text-[color:var(--ink-1)]">{td.title}</h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--ink-2)]">{td.summary}</p>
        </div>
        {chapter ? (
          <Link
            to={`/course/${chapter.slug}`}
            className="mt-6 inline-flex rounded-full border border-[rgba(15,31,49,0.12)] bg-white/75 px-5 py-3 text-sm text-[color:var(--ink-1)] transition hover:bg-white"
          >
            回到章节：{chapter.number}. {chapter.title}
          </Link>
        ) : null}
      </section>

      {pageCallouts.map((announcement) => (
        <PageCallout
          key={announcement.id}
          announcement={announcement}
          context={{
            pathname: `/tds/${td.slug}`,
            tdSlug: td.slug,
            pageTitle: td.title,
          }}
        />
      ))}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <SourcePackSection
            eyebrow="题目原文"
            title="题目讲义、原题与参考材料"
            description="先看题目原文、翻译稿和 correction，再决定自己是先独立做还是直接对照笔记。"
            items={td.questionMaterials}
            emptyMessage="这一页当前没有挂载独立题目材料。"
          />

          <section className="glass-card rounded-[32px] p-6 md:p-8">
            <div className="eyebrow">对应笔记</div>
            <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">对应笔记拆解</h2>
            <div className="mt-6 space-y-6">
              {td.noteEntries.map((note) => (
                <article key={note.slug} className="rounded-[28px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="eyebrow">笔记 {note.slug.toUpperCase()}</div>
                      <h3 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">{note.title}</h3>
                    </div>
                    <Link
                      to={`/notes/${note.slug}`}
                      className="rounded-full border border-[rgba(15,31,49,0.12)] bg-white px-4 py-2 text-sm text-[color:var(--ink-1)] transition hover:bg-[rgba(246,238,224,0.82)]"
                    >
                      打开单独笔记页
                    </Link>
                  </div>
                  <div className="mt-6">
                    <MarkdownArticle content={note.content} idPrefix={`${note.slug}-`} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <SourcePackSection
            eyebrow="配套脚本"
            title="对应脚本与命令实现"
            description="这里直接对接对应的练习脚本。做题时可以把题目、笔记和脚本放在一起交叉验证。"
            items={td.scriptMaterials}
            emptyMessage="这组 TD 当前没有仓库内脚本，建议直接使用上面的题目材料和下面的交互实验。"
          />

          <section className="glass-card rounded-[32px] p-6">
            <div className="eyebrow">交互实验</div>
            <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">相关交互实验</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {relatedSandboxes.length ? (
                relatedSandboxes.map((sandbox) => (
                  <Link
                    key={sandbox.slug}
                    to={`/practice/${sandbox.slug}`}
                    className="rounded-full border border-[rgba(52,106,144,0.18)] bg-white/85 px-4 py-2 text-sm text-[color:var(--ink-1)] transition hover:border-[rgba(52,106,144,0.32)] hover:bg-white"
                  >
                    {sandbox.title}
                  </Link>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[rgba(15,31,49,0.14)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-2)]">
                  当前没有独立交互实验，建议直接顺着题目和笔记推演。
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <MarkdownTocNav eyebrow="本页目录" title="题单标题跳转" groups={tocGroups} />
        </aside>
      </div>
    </div>
  );
}
