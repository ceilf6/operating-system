# 项目地图

## 系统概览

项目由三层组成：

1. 原始课程资料层  
   `base-files/`、`notes/`、`sandbox/`
2. 生成数据层  
   `scripts/*.py` 把原始资料转换成 `src/content/generated/*.json`
3. 前端展示层  
   `src/` 下的 React 页面读取 JSON，渲染为静态网站

简化后的数据流：

```text
base-files/ + notes/ + sandbox/
  -> scripts/extract_sources.py
  -> scripts/normalize_content.py
  -> scripts/build_search_index.py
  -> src/content/generated/*.json
  -> src/lib/content.ts
  -> src/pages/* + src/components/*
  -> vite build
  -> dist/
  -> GitHub Pages
```

## 目录职责

### 原始资料

- `base-files/`
  课程课件、题单、翻译稿、项目材料。是课程原文和官方资料的主要来源。
- `notes/`
  教学化整理后的笔记。网站中的笔记页主要来自这里。
- `sandbox/`
  Shell 脚本、命令示例和练习实现。网站的题单页和部分章节会引用这里的内容。

### 内容生成

- `scripts/extract_sources.py`
  扫描资料目录，提取文本，生成 `source-manifest.json` 和 `extracted/*.md`。
- `scripts/normalize_content.py`
  维护课程结构定义，把资料编排成章节、术语、题单、笔记页、沙箱配置。
- `scripts/build_search_index.py`
  从生成后的章节、笔记、题单、术语、沙箱构建搜索索引。
- `scripts/bootstrap-material-tools.sh`
  本地环境依赖安装脚本。

### 前端

- `src/app/`
  应用入口和路由。
- `src/pages/`
  顶层页面。
- `src/components/`
  章节块、布局、导航、搜索、沙箱 UI。
- `src/sandboxes/`
  沙箱背后的纯逻辑函数。
- `src/lib/content.ts`
  运行时访问内容数据的唯一入口。
- `src/content/generated/`
  由脚本生成的 JSON，前端静态导入这里的内容。

### 部署

- `public/`
  静态资源。当前有 `favicon.svg` 和 GitHub Pages SPA 回退用的 `404.html`。
- `.github/workflows/deploy.yml`
  GitHub Pages 自动部署。
- `vite.config.ts`
  Vite 构建配置，包含 GitHub Pages 所需的 `base`。

## 重要文件清单

- [package.json](../package.json)
  所有开发、生成、构建命令入口。
- [vite.config.ts](../vite.config.ts)
  打包时基础路径固定为 `/operating-system/`。
- [src/app/router.tsx](../src/app/router.tsx)
  定义全部站点路由，同时用 `basename={import.meta.env.BASE_URL}` 对齐 Pages 子路径。
- [src/lib/content.ts](../src/lib/content.ts)
  把生成文件统一映射为 TypeScript 接口和查询函数。
- [index.html](../index.html)
  包含 GitHub Pages SPA 回跳脚本。
- [public/404.html](../public/404.html)
  解决 GitHub Pages 刷新子路由时的 404。

## 哪些是源码，哪些是产物

### 源码 / 真实维护对象

- `base-files/`
- `notes/`
- `sandbox/`
- `scripts/`
- `src/`
- `public/`
- `.github/workflows/`

### 派生产物

- `src/content/generated/*.json`
- `src/content/generated/extracted/*.md`
- `dist/`

派生产物不要手改。要改内容，回到脚本或原始资料。

## 私有目录约定

以下目录虽然可能存在于本地工作区，但默认不参与共享构建：

- `base-files/project/`
- `base-files/true/`
- `base-files/from-teacher/`

原因：

- 这些目录可能存放私有、临时或不希望公开到远端仓库的资料
- CI 环境不会拥有它们
- 如果把它们混入生成链路，会导致本地和远端的 generated JSON 不一致

## 已知历史遗留

- [scripts/link-base-files-to-notes.py](../scripts/link-base-files-to-notes.py) 和对应的 [scripts/link-base-files-to-notes.mapping.json](../scripts/link-base-files-to-notes.mapping.json) 是历史一次性辅助工具，不在当前构建链路里运行。
- 旧版 README 提到过 symlink 优化。现在不应再依赖绝对路径 symlink，因为 CI 会直接炸。
