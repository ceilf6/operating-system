import { useMemo, useState } from "react";
import { BellRing, X } from "lucide-react";
import type { SiteAnnouncement } from "../../content/site/community";
import {
  type CommunityRouteContext,
  dismissAnnouncement,
  isAnnouncementDismissed,
  readDismissedAnnouncements,
} from "../../lib/community";
import { CommunityActionGroup } from "./CommunityActionGroup";

interface AnnouncementBarProps {
  announcements: SiteAnnouncement[];
  context: CommunityRouteContext;
}

export function AnnouncementBar({ announcements, context }: AnnouncementBarProps) {
  const [dismissedState, setDismissedState] = useState<Record<string, number>>(() =>
    readDismissedAnnouncements(),
  );

  const visibleAnnouncements = useMemo(
    () =>
      announcements.filter(
        (announcement) =>
          !announcement.dismissible || !isAnnouncementDismissed(announcement, dismissedState),
      ),
    [announcements, dismissedState],
  );

  if (!visibleAnnouncements.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleAnnouncements.map((announcement) => (
        <section
          key={announcement.id}
          className="glass-card flex flex-col gap-4 rounded-[30px] border-[rgba(52,106,144,0.18)] bg-[rgba(255,250,242,0.94)] p-5 md:flex-row md:items-start md:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="eyebrow">
                <BellRing className="h-3.5 w-3.5" />
                {announcement.badge}
              </div>
              <h2 className="page-title text-2xl text-[color:var(--ink-1)]">
                {announcement.title}
              </h2>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-8 text-[color:var(--ink-2)]">
              {announcement.body}
            </p>
            <CommunityActionGroup
              actions={announcement.actions}
              context={context}
              className="mt-4"
            />
          </div>
          {announcement.dismissible ? (
            <button
              type="button"
              onClick={() => setDismissedState(dismissAnnouncement(announcement))}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-[rgba(15,31,49,0.1)] bg-white/90 text-[color:var(--ink-2)] transition hover:bg-white md:self-start"
              aria-label="关闭公告"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </section>
      ))}
    </div>
  );
}
