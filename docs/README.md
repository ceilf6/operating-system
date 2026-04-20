# 维护文档索引

这组文档是给后续没有上下文的维护者和 agent 用的。目标不是介绍课程内容，而是说明这个仓库如何构建、如何生成内容、如何部署、以及修改时最容易踩到的坑。

## 建议阅读顺序

1. [project-map.md](./project-map.md)
2. [content-pipeline.md](./content-pipeline.md)
3. [frontend-maintenance.md](./frontend-maintenance.md)
4. [community-feedback.md](./community-feedback.md)
5. [change-playbooks.md](./change-playbooks.md)
6. [deployment-runbook.md](./deployment-runbook.md)
7. [troubleshooting.md](./troubleshooting.md)

## 项目一句话

这是一个基于本地课程资料生成的静态 React 网站。原始资料在 `base-files/`、`notes/`、`sandbox/`，中间经过 Python 脚本归一化为 `src/content/generated/*.json`，再由 React 页面渲染成课程站。

## 快速命令

```bash
npm install
bash scripts/bootstrap-material-tools.sh
npm run dev
npm run build
npm run preview
```

说明：

- `npm run dev` 会先自动执行一次 `generate`，然后启动 Vite，并监听课程资料与生成脚本变化，自动重新生成内容。
- `npm run dev:vite` 只启动纯 Vite，不带内容监听。

## 维护原则

- 原始资料是 `base-files/`、`notes/`、`sandbox/`，不要手改 `src/content/generated/` 里的 JSON。
- 页面面向学生，不要在 UI 中暴露仓库结构、覆盖率、内部路径、生成状态等工程信息。
- 新资料放进仓库后，不会自动变成可读章节或题单；通常还要更新 `scripts/normalize_content.py` 中的规则。
- GitHub Pages 部署依赖子路径 `/operating-system/`，不要随手改 `vite.config.ts`、`src/app/router.tsx`、`index.html`、`public/404.html` 中的相关逻辑。
- 如果改了架构、生成链路、部署链路或维护流程，同步更新这组文档。

## 关键入口

- 构建脚本: [package.json](../package.json)
- 内容抽取: [scripts/extract_sources.py](../scripts/extract_sources.py)
- 内容归一化: [scripts/normalize_content.py](../scripts/normalize_content.py)
- 搜索索引: [scripts/build_search_index.py](../scripts/build_search_index.py)
- 运行时内容接口: [src/lib/content.ts](../src/lib/content.ts)
- 路由: [src/app/router.tsx](../src/app/router.tsx)
- Pages 部署: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)
