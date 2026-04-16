import { Link } from "react-router-dom";
import { getChapterBySlug, getProjectAssets } from "../lib/content";
import { getProjectMediaAssets } from "../lib/sourceCoverage";

export function ProjectPage() {
  const chapter = getChapterBySlug("sync-deadlock-scheduling");
  const projectAssets = getProjectAssets().filter((asset) => asset.kind === "project");
  const mediaAssets = getProjectMediaAssets();

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-[40px] p-6 md:p-8">
        <div className="eyebrow">Capstone Project</div>
        <h1 className="page-title mt-4 text-5xl leading-tight text-[color:var(--ink-1)]">
          SyncFS 课程项目与综合实践
        </h1>
        <p className="mt-5 max-w-4xl text-[1.02rem] leading-8 text-[color:var(--ink-2)]">
          项目部分把操作系统理论里的资源一致性与冲突判断，落到 Bash 文件同步器实现上。它也是整个课程站点里把“算法规则”真正转成“工程交付”的桥段。
        </p>
        {chapter ? (
          <Link
            to={`/course/${chapter.slug}`}
            className="mt-6 inline-flex rounded-full bg-[color:var(--ink-0)] px-5 py-3 text-sm text-white transition hover:bg-[color:var(--ink-1)]"
          >
            返回综合章节
          </Link>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="glass-card rounded-[32px] p-6">
          <div className="eyebrow">Project Workbook</div>
          <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">项目任务与参考材料</h2>
          <div className="mt-5 space-y-4">
            {projectAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/75 p-4"
              >
                <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">
                  {asset.kind}
                </p>
                <h3 className="page-title mt-3 text-2xl text-[color:var(--ink-1)]">
                  {asset.displayName}
                </h3>
                {asset.excerpt ? (
                  <p className="mt-4 text-sm leading-7 text-[color:var(--ink-2)]">{asset.excerpt}</p>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card rounded-[32px] p-6">
          <div className="eyebrow">Teacher Notes</div>
          <h2 className="page-title mt-4 text-3xl text-[color:var(--ink-1)]">教师补充示例</h2>
          <div className="mt-5 space-y-4">
            {mediaAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/75 p-4"
              >
                <h3 className="page-title text-2xl text-[color:var(--ink-1)]">{asset.displayName}</h3>
                {asset.publicPath?.endsWith(".mp4") ? (
                  <video controls className="mt-4 w-full rounded-[20px]">
                    <source src={asset.publicPath} />
                  </video>
                ) : asset.publicPath ? (
                  <img
                    src={asset.publicPath}
                    alt={asset.displayName}
                    className="mt-4 w-full rounded-[20px] border border-[rgba(15,31,49,0.1)]"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
