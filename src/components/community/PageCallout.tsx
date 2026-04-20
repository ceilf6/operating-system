import { MessageSquareMore } from "lucide-react";
import type { SiteAnnouncement } from "../../content/site/community";
import type { CommunityRouteContext } from "../../lib/community";
import { CommunityActionGroup } from "./CommunityActionGroup";

interface PageCalloutProps {
  announcement: SiteAnnouncement;
  context: CommunityRouteContext;
}

export function PageCallout({ announcement, context }: PageCalloutProps) {
  return (
    <section className="glass-card rounded-[30px] border-[rgba(52,106,144,0.18)] bg-[rgba(255,251,246,0.9)] p-6">
      <div className="flex items-center gap-3 text-sm text-[color:var(--signal-blue)]">
        <MessageSquareMore className="h-5 w-5" />
        {announcement.badge}
      </div>
      <h2 className="page-title mt-4 text-3xl leading-tight text-[color:var(--ink-1)]">
        {announcement.title}
      </h2>
      <p className="mt-4 max-w-4xl text-[0.98rem] leading-8 text-[color:var(--ink-2)]">
        {announcement.body}
      </p>
      <CommunityActionGroup actions={announcement.actions} context={context} className="mt-5" />
    </section>
  );
}
