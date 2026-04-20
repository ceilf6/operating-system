# 公告与反馈配置手册

这套站内“公告 + 公开交流 + 私密反馈”能力是静态实现的，不依赖站内后端。前端只负责显示入口和拼接预填参数，真正接收内容的是 GitHub Discussions 与 Google Forms。

## 代码入口

- 配置文件: [src/content/site/community.ts](../src/content/site/community.ts)
- 路由与预填逻辑: [src/lib/community.ts](../src/lib/community.ts)
- 全站公告: [src/components/community/AnnouncementBar.tsx](../src/components/community/AnnouncementBar.tsx)
- 首页反馈区: [src/components/community/CommunitySection.tsx](../src/components/community/CommunitySection.tsx)
- 页面内提示卡: [src/components/community/PageCallout.tsx](../src/components/community/PageCallout.tsx)

## 你需要替换的内容

### 1. GitHub Discussions 链接

在 `community.ts` 中替换：

- `discussions.siteFeedbackUrl`
- `discussions.tdSeDiscussionUrl`

建议先在仓库 Discussions 中手动创建并置顶：

- `网站反馈征集`
- `TD-SE 2026 交流`

替换成这两条 discussion 的精确 URL，不要长期保留仓库 discussions 根地址。

### 2. Google Form 地址

在 `community.ts` 中替换：

- `feedbackForm.baseUrl`

当前默认值是占位地址：

```text
https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform
```

只要还带 `REPLACE_WITH`，前端就会把“私密反馈”按钮渲染成禁用态，避免把学生带到 404。

### 3. Google Form 的 entry id

在 `community.ts` 中替换 `feedbackForm.entryMap` 下的所有占位值，例如：

```ts
pageUrl: "entry.123456789",
pageTitle: "entry.987654321",
```

获取方法：

1. 打开 Google Form
2. 手动填一份测试内容
3. 点击“获取预填链接”
4. 在生成的 URL 中找到各字段对应的 `entry.xxxxx`

## Google Form 字段设计

建议保持下面这 8 个字段，和当前前端预填逻辑一致：

1. `反馈类型`
2. `当前页面 URL`
3. `当前页面标题`
4. `页面上下文`
5. `性能卡顿位置`
6. `仓库存在但网站未展示的内容`
7. `详细建议`
8. `可选联系方式`

当前前端会自动预填：

- `当前页面 URL`
- `当前页面标题`
- `页面上下文`

如果你愿意，也可以保留 `反馈类型` 的 entry id。当前逻辑只会在 TD-SE 定向表单场景里预填“其他”，普通站点反馈不会强行替你选项。

## Google Sheets 与邮件通知

Google Form 只负责收集。真正让反馈“回到你手上”，建议走：

```text
Google Form -> Google Sheets -> Apps Script -> 邮件通知
```

### Apps Script 示例

把下面这段脚本挂到 Form 绑定的 Google Sheets 上：

```javascript
const EMAIL_TO = "your-email@example.com";

function onFormSubmit(e) {
  const values = e.namedValues || {};

  const feedbackType = pick(values, "反馈类型");
  const pageTitle = pick(values, "当前页面标题");
  const pageUrl = pick(values, "当前页面 URL");
  const pageContext = pick(values, "页面上下文");
  const performanceArea = pick(values, "性能卡顿位置");
  const missingContent = pick(values, "仓库存在但网站未展示的内容");
  const suggestion = pick(values, "详细建议");
  const contact = pick(values, "可选联系方式");

  const subject = `[OS网站反馈][${feedbackType || "未分类"}] ${pageTitle || "未命名页面"}`;
  const body = [
    `提交时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    `反馈类型: ${feedbackType || "-"}`,
    `页面标题: ${pageTitle || "-"}`,
    `页面 URL: ${pageUrl || "-"}`,
    `页面上下文: ${pageContext || "-"}`,
    "",
    "性能卡顿位置:",
    performanceArea || "-",
    "",
    "仓库存在但网站未展示的内容:",
    missingContent || "-",
    "",
    "详细建议:",
    suggestion || "-",
    "",
    `联系方式: ${contact || "-"}`,
  ].join("\n");

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject,
    body,
  });
}

function pick(values, key) {
  return Array.isArray(values[key]) ? values[key][0] : "";
}
```

然后：

1. 在 Apps Script 中保存
2. 创建一个 installable trigger
3. 选择 `onFormSubmit`
4. 第一次运行时完成授权

## 前端行为说明

### 公告关闭

- 存储位置: `localStorage`
- key: `os-site:dismissed-announcements`
- 存储内容: `announcement id -> version`

含义：

- 同一个公告被关闭后，本地不会再显示
- 如果你把公告的 `version` 提高，所有人会再次看到它

### 页面上下文值

前端会自动生成：

- 首页: `site-wide`
- `notes/17`: `note-17`
- `tds/td-se-2026`: `td-se-2026`
- 其他页面: 按路由路径压平，例如 `/course/memory-paging` -> `course-memory-paging`

## 发布前检查

至少点这几处：

1. 首页顶部公告条
2. 首页“反馈与交流”区域
3. `/tds/td-se-2026`
4. `/notes/17`

确认：

- 公开交流跳到正确 discussion
- 私密反馈按钮在未配置时是禁用态
- 填好 Google Form 后，私密反馈会带着预填参数打开
- 关闭公告后刷新页面不会重新出现

## 常见问题

### 为什么按钮显示“待配置”

因为 `community.ts` 里还是占位值，通常是：

- `baseUrl` 还没替换
- `entryMap` 还是 `REPLACE_WITH_...`

### 为什么点私密反馈没有带参数

通常是 Google Form 的字段 entry id 填错了，或者你把问题标题改了，但还在沿用旧表单。

### 为什么页面里没有出现 TD-SE 提示卡

检查：

- `community.ts` 中 `scope.kind`
- `scope.slugs`
- 当前页面 slug 是否仍然是 `td-se-2026` / `17`
