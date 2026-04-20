# 常见改动操作手册

## 1. 修改一份现有笔记

适用场景：

- 修正文案
- 补充解释
- 调整示例

步骤：

1. 直接修改 `notes/*.md`
2. 如果正在执行 `npm run dev`，等待自动重新生成
3. 否则手动运行 `npm run generate`
4. 检查 `src/content/generated/notes.json` 和对应章节 JSON 是否更新
5. 运行 `npm run build`

如果你直接 push 而没有手动更新 generated 文件，`sync-generated.yml` 也会在远端自动补交 `src/content/generated/**`。
代价是远端 `main` 会多一个 bot commit，本地下次继续 push 前最好先 `git pull --rebase`。

如果页面里没出现预期变化，通常不是构建问题，而是该笔记没有被 `NOTE_RELATION_RULES` 正确挂到页面结构里。

## 2. 新增一份笔记并让网站出现独立页面

步骤：

1. 新建 `notes/*.md`
2. 在 `scripts/normalize_content.py` 的 `NOTE_RELATION_RULES` 中补对应关系
3. 确认这份笔记属于哪个章节
4. 如果需要出现在某个题单页里，更新对应 `TD_DEFS`
5. 运行 `npm run generate`，或者在 `npm run dev` 下等待自动重新生成
6. 运行 `npm run build`

## 3. 新增一个 TD 页面

步骤：

1. 准备对应的 `base-files` 题目材料、`notes` 笔记和 `sandbox` 脚本
2. 在 `TD_DEFS` 中新增定义
3. 确认 `chapterSlug`、`notePatterns`、`basePatterns`、`scriptPatterns`、`sandboxIds`
4. 运行 `npm run generate`，或者在 `npm run dev` 下等待自动重新生成
5. 检查 `src/content/generated/td-pages.json`
6. 运行 `npm run build`

只加资料文件不会自动长出题单页。

## 4. 新增一个章节

步骤：

1. 在 `CHAPTER_DEFS` 中新增章节定义
2. 设定 `slug`、`number`、`track`、`title`、`summary`、`searchKeywords`
3. 补齐与之关联的 section、复习要点、来源模式
4. 检查上一章 / 下一章顺序
5. 运行 `npm run generate`
6. 运行 `npm run build`

## 5. 新增一个交互沙箱

步骤：

1. 在 `SANDBOX_SPECS` 中新增 spec
2. 在 `src/sandboxes/` 添加或扩展算法逻辑
3. 在 `SandboxRegistry.tsx` 增加对应 UI
4. 在章节或 TD 中关联新的 sandbox id
5. 运行 `npm run generate && npm run build`

## 6. 修改搜索行为

常见原因：

- 想让新页面被搜索到
- 想增加关键词
- 搜索结果类型变化

步骤：

1. 修改 [scripts/build_search_index.py](../scripts/build_search_index.py)
2. 如果类型变化，更新 [src/lib/content.ts](../src/lib/content.ts) 中 `SearchRecord["kind"]`
3. 同步更新 [src/components/search/SearchPanel.tsx](../src/components/search/SearchPanel.tsx) 和 [src/pages/SearchPage.tsx](../src/pages/SearchPage.tsx)
4. 运行 `npm run generate && npm run build`

## 7. 修改 GitHub Pages 路径或仓库名

如果部署路径不再是 `/operating-system/`，必须一起改：

1. [vite.config.ts](../vite.config.ts) 中的 `base`
2. [public/404.html](../public/404.html) 中硬编码的路径
3. [index.html](../index.html) 中的 SPA 回跳脚本
4. GitHub Pages 访问地址和相关文档

`src/app/router.tsx` 中的 `basename={import.meta.env.BASE_URL}` 一般不需要单独改。

## 8. 只想修一个页面文案

步骤：

1. 先判断文案来自哪里
   - React 页面源码
   - 生成 JSON
   - 原始资料
2. 如果是学生站点 UI 的静态文案，直接改 `src/pages/*` 或 `src/components/*`
3. 如果是由数据生成的文案，回到脚本或源资料，不要手改 generated JSON
4. 运行 `npm run build`

## 9. 提交前最小检查

至少执行：

```bash
npm run generate
npm run build
```

如果改的是内容覆盖关系，再执行：

```bash
npm run check:coverage
```

## 10. 发布或更新一条公告 / 反馈入口

步骤：

1. 打开 [src/content/site/community.ts](../src/content/site/community.ts)
2. 找到要修改的 `announcement`
3. 修改 `title`、`body`、`actions`
4. 如果希望所有已关闭用户重新看到它，提升 `version`
5. 如果换了讨论区或表单，顺手同步更新：
   - `discussions`
   - `feedbackForm`
6. 运行 `npm run build`

如果这次还涉及外部服务配置，再对照 [community-feedback.md](./community-feedback.md) 检查 Google Form 和 Apps Script。
