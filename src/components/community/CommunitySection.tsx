import { Link } from "react-router-dom";
import { MessagesSquare, NotebookPen } from "lucide-react";
import { tdSePageRoute } from "../../content/site/community";
import { getAnnouncementsForPlacement } from "../../lib/community";
import { CommunityActionGroup } from "./CommunityActionGroup";

export function CommunitySection() {
  const homeAnnouncements = getAnnouncementsForPlacement("home-section", { pathname: "/" });

  if (!homeAnnouncements.length) {
    return null;
  }

  return (
    <section className="glass-card rounded-[40px] p-6 md:p-8">
      <div className="eyebrow">反馈与交流</div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="page-title text-4xl text-[color:var(--ink-1)]">把使用反馈和做题讨论集中收进来</h2>
          <p className="mt-4 max-w-3xl text-[0.98rem] leading-8 text-[color:var(--ink-2)]">
            站点问题、内容遗漏和 TD-SE 的个人整理，都放在这里给你一个明确入口。公开内容去讨论区，私密内容走表单。
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {homeAnnouncements.map((announcement) => {
          const isTdSeCard = announcement.id === "td-se-home";

          return (
            <article
              key={announcement.id}
              className="rounded-[30px] border border-[rgba(15,31,49,0.1)] bg-white/82 p-6 shadow-[0_18px_36px_rgba(15,31,49,0.06)]"
            >
              <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
                {isTdSeCard ? (
                  <NotebookPen className="h-5 w-5" />
                ) : (
                  <MessagesSquare className="h-5 w-5" />
                )}
                {announcement.badge}
              </div>
              <h3 className="page-title mt-5 text-3xl leading-tight text-[color:var(--ink-1)]">
                {announcement.title}
              </h3>
              <p className="mt-4 text-[0.98rem] leading-8 text-[color:var(--ink-2)]">
                {announcement.body}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {isTdSeCard ? (
                  <Link
                    to={tdSePageRoute}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink-0)] px-4 py-2 text-sm text-white transition hover:bg-[color:var(--ink-1)]"
                  >
                    打开题单页
                  </Link>
                ) : null}
                <CommunityActionGroup
                  actions={announcement.actions}
                  context={{ pathname: "/", pageTitle: "首页" }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
