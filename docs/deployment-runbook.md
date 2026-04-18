# 部署与运行手册

## 本地开发

### 依赖

- Node.js
- npm
- Python 3
- 文档抽取工具
  - `pandoc`
  - `pdftotext` 和 `pdfinfo` 来自 `poppler`
  - `tesseract`

建议直接运行：

```bash
bash scripts/bootstrap-material-tools.sh
```

### 常用命令

```bash
npm install
npm run dev
npm run build
npm run preview
```

开发时说明：

- `npm run dev` 会先生成内容，再启动 Vite，并监听 `README.md`、`notes/`、`base-files/`、`sandbox/` 以及核心生成脚本变化。
- `npm run dev:vite` 只启动 Vite，不会自动重新生成内容。
- 如果只想单独刷新生成数据，也可以手动执行 `npm run generate`。

## GitHub Pages 部署

工作流文件：

- [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)
- [.github/workflows/sync-generated.yml](../.github/workflows/sync-generated.yml)

当前部署目标：

- `https://ceilf6.github.io/operating-system/`

### 工作流做了什么

1. checkout 代码
2. 安装 Node 20
3. 安装 Python 3.11
4. 安装 `pandoc poppler-utils tesseract-ocr`
5. `npm ci`
6. `npm run build`
7. 上传 `dist/`
8. 部署到 GitHub Pages

### generated 文件自动回写

额外还有一个 workflow：

- `sync-generated.yml`

它会在 `main` 分支收到资料类变更后：

1. 重新执行 `npm run generate`
2. 检查 `src/content/generated/**` 是否变化
3. 如果有变化，自动提交回 `main`

注意：

- 这意味着你本地只改 `notes/`、`base-files/`、`sandbox/` 或生成脚本后，直接 push 也可以，远端仓库里的 generated JSON 会由 bot 补交。
- 这个 bot 提交只改 `src/content/generated/**`，`deploy.yml` 已经配置为忽略“仅 generated 文件”的 push，避免重复部署。
- push 之后远端 `main` 可能会比你本地多一个 bot 提交。继续开发前建议先 `git pull --rebase`。

## GitHub Pages 相关关键文件

### 1. Vite base

文件: [vite.config.ts](../vite.config.ts)

当前配置：

- 开发时 `base = "/"`
- 构建时 `base = "/operating-system/"`

### 2. Router basename

文件: [src/app/router.tsx](../src/app/router.tsx)

必须保留：

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

### 3. SPA 刷新回跳

文件：

- [index.html](../index.html)
- [public/404.html](../public/404.html)

用途：

- GitHub Pages 对子路由没有服务端路由支持
- 直接刷新 `/notes/...`、`/tds/...` 会先落到 `404.html`
- `404.html` 把路径编码后跳回 `/?/...`
- `index.html` 中的脚本再把路径还原给前端路由

删掉任意一边，深链接刷新都会坏。

## 如果仓库名或站点路径变化

必须同步修改：

1. [vite.config.ts](../vite.config.ts)
2. [public/404.html](../public/404.html)
3. [index.html](../index.html)
4. 本文档和 README 中的链接

## 部署前检查

```bash
npm run build
```

建议再看一次产物：

```bash
ls -la dist
sed -n '1,80p' dist/index.html
sed -n '1,80p' dist/404.html
```

重点确认：

- `dist/index.html` 的资源路径前缀是 `/operating-system/`
- `dist/404.html` 存在
- `dist/favicon.svg` 存在

## 部署后的快速验证

打开线上站点后至少验证：

1. 首页能打开
2. `favicon` 正常显示
3. 随便打开一个 `/course/...` 页面
4. 在子路由上直接刷新，确认不 404
5. 搜索页能返回结果
