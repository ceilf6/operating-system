import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import clsx from "clsx";
import { MarkdownHeading } from "../../lib/content";

interface MarkdownTocGroup {
  id: string;
  title: string;
  items: MarkdownHeading[];
}

interface MarkdownTocNavProps {
  eyebrow?: string;
  title?: string;
  groups: MarkdownTocGroup[];
}

const depthClassNames: Record<number, string> = {
  1: "pl-3",
  2: "pl-3",
  3: "pl-6",
  4: "pl-9",
};

const HEADER_OFFSET = 132;

export function MarkdownTocNav({
  eyebrow = "页面目录",
  title = "标题跳转",
  groups,
}: MarkdownTocNavProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const visibleGroups = useMemo(() => groups.filter((group) => group.items.length > 0), [groups]);
  const allHeadings = useMemo(
    () => visibleGroups.flatMap((group) => group.items.map((item) => ({ ...item, groupTitle: group.title }))),
    [visibleGroups],
  );
  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return decodeURIComponent(window.location.hash.replace(/^#/, ""));
  });

  if (!visibleGroups.length) {
    return null;
  }

  const scrollToHeading = (id: string, behavior: ScrollBehavior = "auto") => {
    const target = document.getElementById(id);
    if (!target) {
      return false;
    }

    const top = Math.max(target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET, 0);
    window.scrollTo({ top, behavior });
    return true;
  };

  useEffect(() => {
    if (!allHeadings.length) {
      return;
    }

    const syncFromViewport = () => {
      const candidates = allHeadings
        .map((heading) => {
          const element = document.getElementById(heading.id);
          if (!element) {
            return null;
          }
          return {
            id: heading.id,
            top: element.getBoundingClientRect().top,
          };
        })
        .filter((item): item is { id: string; top: number } => item !== null);

      if (!candidates.length) {
        return;
      }

      const passed = candidates.filter((item) => item.top <= HEADER_OFFSET);
      if (passed.length > 0) {
        setActiveId(passed[passed.length - 1].id);
        return;
      }

      setActiveId(candidates[0].id);
    };

    let frameId = 0;
    const scheduleSync = () => {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncFromViewport();
      });
    };

    const syncFromHash = (behavior: ScrollBehavior = "auto") => {
      const nextId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!nextId) {
        scheduleSync();
        return;
      }

      setActiveId(nextId);

      let attempts = 0;
      const tryScroll = () => {
        if (scrollToHeading(nextId, attempts === 0 ? behavior : "smooth")) {
          scheduleSync();
          return;
        }

        if (attempts < 6) {
          attempts += 1;
          window.requestAnimationFrame(tryScroll);
        }
      };

      window.requestAnimationFrame(tryScroll);
    };

    syncFromHash("auto");
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    const handleHashChange = () => syncFromHash("auto");
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [allHeadings]);

  useEffect(() => {
    if (!activeId || !navRef.current) {
      return;
    }

    const activeLink = navRef.current.querySelector<HTMLButtonElement>(`button[data-heading-id="${CSS.escape(activeId)}"]`);
    activeLink?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const activeHeading = allHeadings.find((heading) => heading.id === activeId);
  const activeGroupTitle = activeHeading?.groupTitle ?? visibleGroups[0].title;
  const activeHeadingTitle = activeHeading?.title ?? visibleGroups[0].items[0]?.title ?? "";

  const handleAnchorClick = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    setActiveId(id);
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    scrollToHeading(id, "smooth");
  };

  return (
    <section
      ref={navRef}
      className="glass-card rounded-[28px] border-[rgba(52,106,144,0.18)] bg-[rgba(255,250,242,0.96)] p-5"
    >
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="page-title mt-4 text-xl text-[color:var(--ink-1)]">{title}</h3>
      <div className="mt-3 rounded-2xl border border-[rgba(52,106,144,0.12)] bg-[rgba(52,106,144,0.08)] px-3 py-3">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">当前定位</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--ink-2)]">{activeGroupTitle}</p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--ink-1)]">{activeHeadingTitle}</p>
      </div>
      <div className="mt-5 space-y-5">
        {visibleGroups.map((group) => (
          <div key={group.id}>
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">{group.title}</p>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-heading-id={item.id}
                  onClick={(event) => handleAnchorClick(event, item.id)}
                  aria-current={activeId === item.id ? "location" : undefined}
                  className={clsx(
                    "block w-full rounded-2xl border px-3 py-2 text-left text-sm leading-6 transition",
                    activeId === item.id
                      ? "border-[rgba(52,106,144,0.3)] bg-[rgba(52,106,144,0.12)] text-[color:var(--ink-1)] shadow-[inset_0_0_0_1px_rgba(52,106,144,0.08)]"
                      : "border-transparent bg-white/70 text-[color:var(--ink-2)] hover:border-[rgba(52,106,144,0.28)] hover:bg-white hover:text-[color:var(--ink-1)]",
                    depthClassNames[item.depth] ?? depthClassNames[4],
                  )}
                >
                  <span className="flex items-start gap-2">
                    <span
                      className={clsx(
                        "mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full transition",
                        activeId === item.id ? "bg-[color:var(--signal-orange)]" : "bg-[rgba(15,31,49,0.16)]",
                      )}
                    />
                    <span>{item.title}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
