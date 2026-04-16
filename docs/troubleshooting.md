# 故障排查

## 1. GitHub Actions 在 `extract_sources.py` 报 `FileNotFoundError`

典型现象：

```text
FileNotFoundError: ... sandbox/test-files/.../file-link.txt
```

原因：

- 资料树里混入了 symlink
- 该 symlink 指向本机绝对路径
- CI 环境当然不存在这个路径

当前修复：

- `scripts/extract_sources.py` 会跳过
  - `sandbox/test-files/**`
  - symlink
  - 不存在路径

如果再次发生：

1. 用 `find sandbox -type l -ls` 查 symlink
2. 检查是否有绝对路径目标
3. 确认该路径是不是本来就不该进入抽取链路

## 2. 本地 `npm run build` 失败，提示缺少 `pandoc` / `pdftotext` / `tesseract`

处理：

```bash
bash scripts/bootstrap-material-tools.sh
```

如果是 CI：

- 检查 [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) 里的 apt 安装步骤

## 3. GitHub Pages 首页能打开，但刷新子路由 404

检查：

1. `public/404.html` 是否存在
2. `index.html` 中的回跳脚本是否还在
3. `vite.config.ts` 的 `base` 是否还是 `/operating-system/`
4. `src/app/router.tsx` 是否保留了 `basename={import.meta.env.BASE_URL}`

## 4. GitHub Pages 资源 404，控制台里静态资源路径不对

典型症状：

- CSS / JS 请求路径还是 `/assets/...`
- 没有带 `/operating-system/`

原因：

- `vite.config.ts` 中的 `base` 被改坏了

正确状态：

- 构建产物中的资源路径应该类似 `/operating-system/assets/...`

## 5. 新加的资料没有出现在网站中

先分清是哪种“没有出现”：

### Manifest 中都没有

说明抽取阶段就没扫到，检查：

- 文件后缀是否受支持
- 文件是否在扫描目录里
- 是否被排除规则跳过
- 是否是 symlink 或不存在路径

### Manifest 有，但页面没有

说明归一化规则没接上，检查：

- `NOTE_RELATION_RULES`
- `TD_DEFS`
- `CHAPTER_DEFS`
- `HIDDEN_SOURCE_PATTERNS`

## 6. 搜索搜不到新增内容

检查：

1. 是否重新跑过 `npm run generate`
2. `scripts/build_search_index.py` 是否覆盖了该内容类型
3. `keywords` 是否足够
4. 页面是否真正被挂进了 route

## 7. 生成后的 JSON diff 很大

先看是否是以下原因：

- 原始资料有新增 / 删除
- 归一化规则调整
- 排除模式变化
- 本地运行产物被误扫入资料目录

重点检查：

- `source-manifest.json`
- `coverage-links.json`
- `notes.json`
- `td-pages.json`
- `chapters/*.json`

## 8. `npm run check:coverage` 失败

说明有资料没有被映射到章节或沙箱。

处理方向：

1. 先确认该资料是否应该对学生可见
2. 如果不该可见，加入隐藏或排除规则
3. 如果应该可见，补章节、笔记或题单映射

## 9. Vite 提示 chunk 太大

当前属于已知告警，不会阻塞部署。

原因：

- `src/content/generated/*.json` 体量较大

如果未来要优化：

- 继续细分 `manualChunks`
- 改造内容为按路由懒加载

在没有明确性能问题前，这不是第一优先级。
