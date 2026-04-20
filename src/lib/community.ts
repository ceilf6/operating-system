import {
  chapters,
  getNotePageBySlug,
  getTdPageBySlug,
  sandboxSpecs,
} from "./content";
import {
  communityConfig,
  dismissedAnnouncementsStorageKey,
  type AnnouncementPlacement,
  type CommunityAction,
  type SiteAnnouncement,
} from "../content/site/community";

export interface CommunityRouteContext {
  pathname: string;
  noteSlug?: string;
  tdSlug?: string;
  pageTitle?: string;
}

export interface ResolvedCommunityContext extends CommunityRouteContext {
  currentUrl: string;
  pageContext: string;
  pageTitle: string;
}

export interface ResolvedCommunityAction extends CommunityAction {
  resolvedHref: string | null;
  disabled: boolean;
  disabledReason?: string;
}

type DismissedAnnouncementsState = Record<string, number>;

const placeholderToken = "REPLACE_WITH_";

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function hasPlaceholder(value: string) {
  return !value || value.includes(placeholderToken);
}

function findNoteSlug(pathname: string) {
  const match = pathname.match(/^\/notes\/([^/]+)$/);
  return match?.[1];
}

function findTdSlug(pathname: string) {
  const match = pathname.match(/^\/tds\/([^/]+)$/);
  return match?.[1];
}

function derivePageTitle(pathname: string, noteSlug?: string, tdSlug?: string) {
  if (tdSlug) {
    return getTdPageBySlug(tdSlug)?.title ?? `题单 ${tdSlug}`;
  }
  if (noteSlug) {
    return getNotePageBySlug(noteSlug)?.title ?? `笔记 ${noteSlug}`;
  }
  if (pathname === "/") {
    return "操作系统学习网站";
  }
  if (pathname === "/notes") {
    return "笔记索引";
  }
  if (pathname === "/tds") {
    return "题单索引";
  }
  if (pathname === "/practice") {
    return "实践与交互实验";
  }
  if (pathname === "/glossary") {
    return "术语表";
  }
  if (pathname === "/review") {
    return "复习面板";
  }
  if (pathname === "/search") {
    return "搜索";
  }

  const chapterMatch = pathname.match(/^\/course\/([^/]+)$/);
  if (chapterMatch) {
    return chapters.find((chapter) => chapter.slug === chapterMatch[1])?.title ?? "章节";
  }

  const sandboxMatch = pathname.match(/^\/practice\/([^/]+)$/);
  if (sandboxMatch) {
    return sandboxSpecs.find((sandbox) => sandbox.slug === sandboxMatch[1])?.title ?? "交互实验";
  }

  return "操作系统学习网站";
}

function derivePageContext(pathname: string, noteSlug?: string, tdSlug?: string) {
  if (tdSlug) {
    return tdSlug;
  }
  if (noteSlug) {
    return `note-${noteSlug}`;
  }
  if (pathname === "/") {
    return "site-wide";
  }
  return pathname.replace(/^\/+/, "").replace(/\//g, "-") || "site-wide";
}

function buildCurrentUrl(pathname: string) {
  if (typeof window !== "undefined" && window.location.pathname.endsWith(pathname)) {
    return window.location.href;
  }

  if (typeof window !== "undefined") {
    return new URL(pathname, window.location.origin).toString();
  }

  return pathname;
}

function matchesScope(announcement: SiteAnnouncement, context: ResolvedCommunityContext) {
  switch (announcement.scope.kind) {
    case "all":
      return true;
    case "home":
      return context.pathname === "/";
    case "td":
      return Boolean(context.tdSlug && announcement.scope.slugs.includes(context.tdSlug));
    case "note":
      return Boolean(context.noteSlug && announcement.scope.slugs.includes(context.noteSlug));
    default:
      return false;
  }
}

export function getResolvedCommunityContext(context: CommunityRouteContext): ResolvedCommunityContext {
  const pathname = normalizePathname(context.pathname);
  const noteSlug = context.noteSlug ?? findNoteSlug(pathname);
  const tdSlug = context.tdSlug ?? findTdSlug(pathname);

  return {
    pathname,
    noteSlug,
    tdSlug,
    pageTitle: context.pageTitle ?? derivePageTitle(pathname, noteSlug, tdSlug),
    pageContext: derivePageContext(pathname, noteSlug, tdSlug),
    currentUrl: buildCurrentUrl(pathname),
  };
}

export function getAnnouncementsForPlacement(
  placement: AnnouncementPlacement,
  context: CommunityRouteContext,
) {
  const resolvedContext = getResolvedCommunityContext(context);

  return communityConfig.announcements.filter(
    (announcement) =>
      announcement.placement.includes(placement) && matchesScope(announcement, resolvedContext),
  );
}

function appendPrefillParam(url: URL, key: string, value: string) {
  if (!value || !key || hasPlaceholder(key)) {
    return;
  }
  url.searchParams.set(key, value);
}

export function isFeedbackFormConfigured() {
  return !hasPlaceholder(communityConfig.feedbackForm.baseUrl);
}

export function buildFeedbackFormUrl(
  context: CommunityRouteContext,
  action?: CommunityAction,
) {
  if (!isFeedbackFormConfigured()) {
    return null;
  }

  const resolvedContext = getResolvedCommunityContext(context);
  const url = new URL(communityConfig.feedbackForm.baseUrl);
  const feedbackType =
    action?.prefillContext === "td-se" ? "其他" : "";
  const pageContext =
    action?.prefillContext === "td-se" ? "td-se-2026" : resolvedContext.pageContext;

  appendPrefillParam(url, communityConfig.feedbackForm.entryMap.feedbackType, feedbackType);
  appendPrefillParam(url, communityConfig.feedbackForm.entryMap.pageUrl, resolvedContext.currentUrl);
  appendPrefillParam(url, communityConfig.feedbackForm.entryMap.pageTitle, resolvedContext.pageTitle);
  appendPrefillParam(url, communityConfig.feedbackForm.entryMap.pageContext, pageContext);

  return url.toString();
}

export function resolveCommunityAction(
  action: CommunityAction,
  context: CommunityRouteContext,
): ResolvedCommunityAction {
  if (action.kind === "form") {
    const resolvedHref = buildFeedbackFormUrl(context, action);
    return {
      ...action,
      resolvedHref,
      disabled: !resolvedHref,
      disabledReason: resolvedHref
        ? undefined
        : "请先在 src/content/site/community.ts 中填入 Google Form 的真实地址和 entry id。",
    };
  }

  const isConfigured = !hasPlaceholder(action.href);
  return {
    ...action,
    resolvedHref: isConfigured ? action.href : null,
    disabled: !isConfigured,
    disabledReason: isConfigured
      ? undefined
      : "请先在 src/content/site/community.ts 中填入真实的外部链接。",
  };
}

export function readDismissedAnnouncements() {
  if (typeof window === "undefined") {
    return {} as DismissedAnnouncementsState;
  }

  try {
    const storedValue = window.localStorage.getItem(dismissedAnnouncementsStorageKey);
    if (!storedValue) {
      return {} as DismissedAnnouncementsState;
    }

    const parsed = JSON.parse(storedValue) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
    );
  } catch {
    return {} as DismissedAnnouncementsState;
  }
}

export function dismissAnnouncement(announcement: SiteAnnouncement) {
  if (typeof window === "undefined") {
    return {} as DismissedAnnouncementsState;
  }

  const nextState = {
    ...readDismissedAnnouncements(),
    [announcement.id]: announcement.version,
  };
  window.localStorage.setItem(dismissedAnnouncementsStorageKey, JSON.stringify(nextState));
  return nextState;
}

export function isAnnouncementDismissed(
  announcement: SiteAnnouncement,
  state: DismissedAnnouncementsState,
) {
  return state[announcement.id] === announcement.version;
}
