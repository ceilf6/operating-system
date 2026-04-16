# 内容流水线

## 总览

内容生成分三步，命令由 `npm run generate` 串起来：

```bash
python3 scripts/extract_sources.py
python3 scripts/normalize_content.py
python3 scripts/build_search_index.py
```

## 第一步: 抽取原始资料

脚本: [scripts/extract_sources.py](../scripts/extract_sources.py)

### 扫描范围

- `README.md`
- `notes/`
- `sandbox/`
- `base-files/`

### 支持类型

- `.md`
- `.txt`
- `.sh`
- `.pdf`
- `.docx`
- `.pptx`
- `.png`
- `.jpg`
- `.jpeg`
- `.mp4`
- `chat`

### 关键行为

- `notes/` 和 `README.md` 归类为 `note`
- `sandbox/` 归类为 `sandbox`
- `base-files/project/` 归类为 `project`
- PDF 优先走 `pdftotext -layout`
- 当单页有效文本少于 `200` 个非空白字符时，尝试 OCR
- OCR 依赖 `pdftoppm` 和 `tesseract`

### 当前显式排除

- `base-files/from-teacher/`
- `sandbox/test-files/**`
- dotfiles
- symlink
- 不存在的路径

排除 `sandbox/test-files/**` 是故意的。这些文件是练习运行产物，不是教学正文，里面还可能含绝对路径 symlink。

### 输出

- `src/content/generated/source-manifest.json`
- `src/content/generated/extracted/*.md`

## 第二步: 归一化为站点内容

脚本: [scripts/normalize_content.py](../scripts/normalize_content.py)

这一步是内容编排的核心，后续维护最容易改到这里。

### 关键配置段

- `HIDDEN_SOURCE_PATTERNS`
  控制哪些资料不向学生展示。
- `SANDBOX_SPECS`
  定义沙箱的元数据。
- `NOTE_RELATION_RULES`
  定义笔记和讲义、脚本、题单之间的对应关系。
- `TD_DEFS`
  定义题单页。
- `CHAPTER_DEFS`
  定义 12 个课程章节。

### 输出

- `src/content/generated/chapters/*.json`
- `src/content/generated/glossary.json`
- `src/content/generated/sandboxes.json`
- `src/content/generated/coverage-links.json`
- `src/content/generated/notes.json`
- `src/content/generated/td-pages.json`

### 这里真正决定了什么

- 章节目录和顺序
- 首页和章节页读到哪些内容
- 每份笔记对应哪些讲义和脚本
- 哪些题目组成一个 TD 页面
- 哪些资料虽然在仓库里，但不该展示给学生

## 第三步: 构建搜索索引

脚本: [scripts/build_search_index.py](../scripts/build_search_index.py)

### 当前搜索覆盖

- 章节
- 章节内 section
- 术语
- 笔记
- 题单
- 沙箱

### 输出

- `src/content/generated/search-index.json`

## 新增资料的正确方式

### 新增普通讲义或题目文件

1. 放进 `base-files/`、`notes/` 或 `sandbox/`
2. 运行 `npm run generate`
3. 如果要在学生页面里出现，更新 `NOTE_RELATION_RULES`、`TD_DEFS` 或 `CHAPTER_DEFS`
4. 再运行 `npm run generate`
5. 检查生成结果是否合理

### 新增笔记页

只有把 `.md` 放进 `notes/` 还不够。还要至少确认：

- 它是否应该挂到某个章节
- 它是否要出现在某个 TD 页面里
- 它对应哪些讲义和脚本

这些通常要改 `NOTE_RELATION_RULES`。

### 新增题单页

要改 `TD_DEFS`，仅新增 `base-files` 或 `notes` 文件不会自动多出题单页。

### 新增章节

要改 `CHAPTER_DEFS`，并同步考虑：

- 上一章 / 下一章顺序
- 章节 summary
- 章节搜索关键词
- 复习页内容
- 哪些笔记 / 题单 / 沙箱属于它

## 维护注意事项

### 不要手改 generated JSON

前端确实直接 import `src/content/generated/*.json`，但这些文件仍然是脚本产物。应改脚本和源资料，再重新生成。

### 关于是否提交 generated 文件

仓库允许提交这些 JSON，方便代码评审和 diff 查看，但它们本质仍是派生产物。

维护原则：

- 可以提交
- 不要手改
- 提交前最好重新跑 `npm run generate`

### Symlink 规则

- 不要在资料目录里引入依赖本机绝对路径的 symlink
- 如果必须保留历史 symlink，保证生成脚本会跳过它
- 任何出现在 CI 中的 `FileNotFoundError`，优先检查是不是资料树里混入了 broken symlink
