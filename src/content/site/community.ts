export type AnnouncementPlacement = "global-banner" | "home-section" | "page-callout";

export type AnnouncementScope =
  | { kind: "all" }
  | { kind: "home" }
  | { kind: "td"; slugs: string[] }
  | { kind: "note"; slugs: string[] };

export type CommunityActionKind = "discussion" | "form" | "github";

export interface CommunityAction {
  id: string;
  label: string;
  kind: CommunityActionKind;
  href: string;
  external: boolean;
  prefillContext?: "current-page" | "td-se";
}

export interface SiteAnnouncement {
  id: string;
  version: number;
  placement: AnnouncementPlacement[];
  scope: AnnouncementScope;
  dismissible: boolean;
  badge: string;
  title: string;
  body: string;
  actions: CommunityAction[];
}

export interface FeedbackFormConfig {
  baseUrl: string;
  entryMap: {
    feedbackType: string;
    pageUrl: string;
    pageTitle: string;
    pageContext: string;
    performanceArea: string;
    missingContentPath: string;
    suggestion: string;
    contact: string;
  };
}

export interface CommunityConfig {
  announcements: SiteAnnouncement[];
  discussions: {
    siteFeedbackUrl: string;
    tdSeDiscussionUrl: string;
  };
  repository: {
    tdSeSourceUrl: string;
    repoUrl: string;
  };
  feedbackForm: FeedbackFormConfig;
}

export const tdSePageRoute = "/tds/td-se-2026";
export const dismissedAnnouncementsStorageKey = "os-site:dismissed-announcements";

const repositoryUrl = "https://github.com/ceilf6/operating-system";
const discussionsRootUrl = `${repositoryUrl}/discussions`;
const googleFormPlaceholderUrl = "https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform";

const discussions = {
  // Replace these with the exact discussion thread URLs after creating and pinning them.
  siteFeedbackUrl: "https://github.com/ceilf6/operating-system/discussions/2",
  tdSeDiscussionUrl: "https://github.com/ceilf6/operating-system/discussions/3",
};

const repository = {
  repoUrl: repositoryUrl,
  tdSeSourceUrl: `${repositoryUrl}/blob/main/notes/17.md`,
};

const feedbackForm = {
  baseUrl: googleFormPlaceholderUrl,
  entryMap: {
    // Replace each placeholder with the real Google Form entry id, e.g. "entry.123456789".
    feedbackType: "entry.REPLACE_WITH_FEEDBACK_TYPE",
    pageUrl: "entry.REPLACE_WITH_PAGE_URL",
    pageTitle: "entry.REPLACE_WITH_PAGE_TITLE",
    pageContext: "entry.REPLACE_WITH_PAGE_CONTEXT",
    performanceArea: "entry.REPLACE_WITH_PERFORMANCE_AREA",
    missingContentPath: "entry.REPLACE_WITH_MISSING_CONTENT_PATH",
    suggestion: "entry.REPLACE_WITH_SUGGESTION",
    contact: "entry.REPLACE_WITH_CONTACT",
  },
} satisfies FeedbackFormConfig;

export const communityConfig: CommunityConfig = {
  discussions,
  repository,
  feedbackForm,
  announcements: [
    {
      id: "site-feedback-banner",
      version: 1,
      placement: ["global-banner"],
      scope: { kind: "all" },
      dismissible: true,
      badge: "反馈征集",
      title: "帮我一起把这个操作系统学习网站做顺手",
      body: "想收集你在使用这个网站时遇到的加载卡顿、内容遗漏和体验问题。公开建议走讨论区，私密内容走表单。",
      actions: [
        {
          id: "site-feedback-public-banner",
          label: "公开交流",
          kind: "discussion",
          href: discussions.siteFeedbackUrl,
          external: true,
        },
        {
          id: "site-feedback-private-banner",
          label: "私密反馈",
          kind: "form",
          href: feedbackForm.baseUrl,
          external: true,
          prefillContext: "current-page",
        },
      ],
    },
    {
      id: "site-feedback-home",
      version: 1,
      placement: ["home-section"],
      scope: { kind: "home" },
      dismissible: false,
      badge: "网站反馈征集",
      title: "把卡顿位置、内容缺口和体验问题直接告诉我",
      body: "尤其欢迎反馈哪些区块明显加载慢、仓库里有但网站里没展示出来的内容，以及你觉得值得继续优化的地方。",
      actions: [
        {
          id: "site-feedback-public-home",
          label: "公开交流",
          kind: "discussion",
          href: discussions.siteFeedbackUrl,
          external: true,
        },
        {
          id: "site-feedback-private-home",
          label: "私密反馈",
          kind: "form",
          href: feedbackForm.baseUrl,
          external: true,
          prefillContext: "current-page",
        },
      ],
    },
    {
      id: "td-se-home",
      version: 1,
      placement: ["home-section"],
      scope: { kind: "home" },
      dismissible: false,
      badge: "TD-SE 2026 交流",
      title: "老师没公布答案，我先把自己的 TD-SE 整理放上来了",
      body: "如果你也在做这一套题，欢迎一起对答案、挑错和补充更稳妥的思路。这份内容不是官方标准答案，而是持续修正的个人整理稿。",
      actions: [
        {
          id: "td-se-home-discussion",
          label: "进入讨论",
          kind: "discussion",
          href: discussions.tdSeDiscussionUrl,
          external: true,
        },
      ],
    },
    {
      id: "td-se-td-callout",
      version: 1,
      placement: ["page-callout"],
      scope: { kind: "td", slugs: ["td-se-2026"] },
      dismissible: false,
      badge: "题单交流",
      title: "这里放的是 TD-SE 2026 的个人整理与推演",
      body: "它不是老师公布的标准答案，更适合拿来对思路、查漏洞和继续讨论细节。如果你发现推导不稳或有更好的写法，欢迎直接交流。",
      actions: [
        {
          id: "td-se-td-callout-discussion",
          label: "参与讨论",
          kind: "discussion",
          href: discussions.tdSeDiscussionUrl,
          external: true,
        },
        {
          id: "td-se-td-callout-source",
          label: "查看仓库原文",
          kind: "github",
          href: repository.tdSeSourceUrl,
          external: true,
        },
      ],
    },
    {
      id: "td-se-note-callout",
      version: 1,
      placement: ["page-callout"],
      scope: { kind: "note", slugs: ["17"] },
      dismissible: false,
      badge: "笔记交流",
      title: "这份笔记同时承担了 TD-SE 个人答案的讨论入口",
      body: "如果你想核对页面置换、调度、同步或黑板题的个人解法，这里对应的是可继续修订的个人整理，不是官方标准答案。",
      actions: [
        {
          id: "td-se-note-callout-discussion",
          label: "参与讨论",
          kind: "discussion",
          href: discussions.tdSeDiscussionUrl,
          external: true,
        },
        {
          id: "td-se-note-callout-source",
          label: "查看仓库原文",
          kind: "github",
          href: repository.tdSeSourceUrl,
          external: true,
        },
      ],
    },
  ],
};
