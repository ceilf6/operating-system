# 前端维护

## 前端架构

运行时内容全部通过 [src/lib/content.ts](../src/lib/content.ts) 暴露给页面。页面不自己读取磁盘文件，也不自己拼接生成目录。

核心链路：

```text
src/content/generated/*.json
  -> src/lib/content.ts
  -> src/pages/*
  -> src/components/*
```

## 开发模式

默认开发命令：

```bash
npm run dev
```

它会做三件事：

1. 先执行一次 `npm run generate`
2. 启动 Vite 开发服务器
3. 监听以下内容并自动重新生成
   - `README.md`
   - `notes/`
   - `base-files/`
   - `sandbox/`
   - `scripts/extract_sources.py`
   - `scripts/normalize_content.py`
   - `scripts/build_search_index.py`

注意：

- `sandbox/test-files/` 的变化会被忽略，避免运行练习脚本时反复触发生成。
- 如果你只想启动纯 Vite，使用 `npm run dev:vite`。

## 路由

定义文件: [src/app/router.tsx](../src/app/router.tsx)

当前固定路由：

- `/`
- `/course/:chapterSlug`
- `/notes`
- `/notes/:noteSlug`
- `/practice`
- `/practice/:sandboxSlug`
- `/tds`
- `/tds/:tdSlug`
- `/glossary`
- `/review`
- `/search`

注意：

- 使用 `BrowserRouter`
- `basename` 来自 `import.meta.env.BASE_URL`
- 部署到 GitHub Pages 子路径时，这个 `basename` 不能删

## 页面职责

### 总览

- [src/pages/HomePage.tsx](../src/pages/HomePage.tsx)
  首页、学习路径、章节入口、笔记入口、题单入口、沙箱入口。

### 课程阅读

- [src/pages/ChapterPage.tsx](../src/pages/ChapterPage.tsx)
  章节主页面，读取 `CourseChapter.sections`。
- [src/pages/NotesIndexPage.tsx](../src/pages/NotesIndexPage.tsx)
  笔记总索引。
- [src/pages/NoteDetailPage.tsx](../src/pages/NoteDetailPage.tsx)
  单份笔记页。
- [src/pages/TdIndexPage.tsx](../src/pages/TdIndexPage.tsx)
  题单总索引。
- [src/pages/TdDetailPage.tsx](../src/pages/TdDetailPage.tsx)
  单个题单页，聚合题目原文、笔记和脚本。

### 工具页

- [src/pages/PracticeHubPage.tsx](../src/pages/PracticeHubPage.tsx)
- [src/pages/SandboxPage.tsx](../src/pages/SandboxPage.tsx)
- [src/pages/GlossaryPage.tsx](../src/pages/GlossaryPage.tsx)
- [src/pages/ReviewPage.tsx](../src/pages/ReviewPage.tsx)
- [src/pages/SearchPage.tsx](../src/pages/SearchPage.tsx)

## 组件分层

### 布局 / 导航

- [src/components/layout/SiteShell.tsx](../src/components/layout/SiteShell.tsx)
- [src/components/navigation/TopNav.tsx](../src/components/navigation/TopNav.tsx)
- [src/components/navigation/AnchorNav.tsx](../src/components/navigation/AnchorNav.tsx)
- [src/components/community/AnnouncementBar.tsx](../src/components/community/AnnouncementBar.tsx)
- [src/components/community/CommunitySection.tsx](../src/components/community/CommunitySection.tsx)
- [src/components/community/PageCallout.tsx](../src/components/community/PageCallout.tsx)

### 内容块

- [src/components/content/BlockRenderer.tsx](../src/components/content/BlockRenderer.tsx)
- [src/components/content/SectionPanel.tsx](../src/components/content/SectionPanel.tsx)
- [src/components/content/MarkdownArticle.tsx](../src/components/content/MarkdownArticle.tsx)
- [src/components/content/SourceDrawer.tsx](../src/components/content/SourceDrawer.tsx)
- [src/components/content/SourcePackSection.tsx](../src/components/content/SourcePackSection.tsx)

### 搜索与沙箱

- [src/components/search/SearchPanel.tsx](../src/components/search/SearchPanel.tsx)
- [src/components/sandbox/SandboxFrame.tsx](../src/components/sandbox/SandboxFrame.tsx)
- [src/components/sandbox/SandboxRegistry.tsx](../src/components/sandbox/SandboxRegistry.tsx)

## 沙箱维护

沙箱由两部分组成：

1. 数据定义  
   `scripts/normalize_content.py` 里的 `SANDBOX_SPECS`
2. 前端实现  
   [src/components/sandbox/SandboxRegistry.tsx](../src/components/sandbox/SandboxRegistry.tsx) 和 `src/sandboxes/*.ts`

### 新增一个沙箱

1. 在 `SANDBOX_SPECS` 中新增 spec
2. 如果需要新算法或推演逻辑，在 `src/sandboxes/` 新增纯函数
3. 在 `SandboxRegistry.tsx` 增加渲染分支
4. 把 sandbox id 关联到章节或 TD 定义
5. 运行 `npm run generate && npm run build`

## 样式维护

- 设计 token: [src/styles/tokens.css](../src/styles/tokens.css)
- 全局样式: [src/styles/globals.css](../src/styles/globals.css)

维护原则：

- 继续保持“学生学习网站”视角
- 避免把仓库目录名、内部 slug、覆盖率、生成状态暴露给学生
- 页面文案优先使用“课堂笔记 / 题单 / 配套脚本 / 交互实验”这类学习语义

## 公告与反馈

站点级公告和反馈入口不走 `generate` 流水线，而是直接来自：

- [src/content/site/community.ts](../src/content/site/community.ts)
- [src/lib/community.ts](../src/lib/community.ts)

这里负责三件事：

1. 全站顶部公告条
2. 首页“反馈与交流”卡片
3. TD-SE 与 `notes/17` 的上下文提示卡

维护规则：

- 讨论区 URL、Google Form URL、entry id 都只改 `community.ts`
- 路由匹配和表单预填只改 `src/content/site/community.ts` / `src/lib/community.ts`
- 不要把公告文案塞回 `README.md` 或内容生成脚本
- 公告关闭状态存储在 `localStorage` 的 `os-site:dismissed-announcements`

如果你希望用户已经关闭的公告重新出现，直接提升对应公告的 `version`。

## 运行时内容接口

优先通过 [src/lib/content.ts](../src/lib/content.ts) 获取内容，不要在页面里直接 import 多个 JSON 文件。

已有接口包括：

- `getChapterBySlug`
- `getSandboxBySlug`
- `getNotePageBySlug`
- `getTdPageBySlug`
- `getNotePagesForChapter`
- `getTdPagesForChapter`
- `getStats`

如果数据结构变了，先改 `src/lib/content.ts`，再改页面。
