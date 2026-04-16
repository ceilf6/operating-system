#!/usr/bin/env python3

from __future__ import annotations

import argparse
import fnmatch
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = ROOT / "src" / "content" / "generated"
MANIFEST_PATH = GENERATED_DIR / "source-manifest.json"
CHAPTERS_DIR = GENERATED_DIR / "chapters"
GLOSSARY_PATH = GENERATED_DIR / "glossary.json"
SANDBOXES_PATH = GENERATED_DIR / "sandboxes.json"
COVERAGE_PATH = GENERATED_DIR / "coverage-links.json"

HIDDEN_SOURCE_PATTERNS = [
    "README.md",
    "sandbox/.DS_Store",
    "sandbox/test-files/*",
    "sandbox/智能提示自动补全而不是展示.sh",
    "sandbox/配置交互智能提示.sh",
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def strip_markdown(text: str) -> str:
    text = re.sub(r"`{1,3}.*?`{1,3}", " ", text, flags=re.S)
    text = re.sub(r"#+\s*", "", text)
    text = re.sub(r"[*_>\-\[\]()]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def split_markdown_chunks(text: str, fallback_title: str) -> list[dict[str, str]]:
    lines = text.splitlines()
    chunks: list[dict[str, str]] = []
    current_title = fallback_title
    buffer: list[str] = []

    def flush() -> None:
        nonlocal buffer, current_title
        body = "\n".join(buffer).strip()
        if body:
            chunks.append({"title": current_title, "body": body})
        buffer = []

    for line in lines:
        heading_like = re.match(r"^(#{1,6}\s+.+|第\s*\d+\s*页[:：]?.+|##\s+Page\s+\d+|##\s+Slide\s+\d+)", line)
        if heading_like:
            flush()
            current_title = strip_markdown(line)
        else:
            buffer.append(line)

    flush()
    if not chunks and text.strip():
        chunks.append({"title": fallback_title, "body": text.strip()})
    return chunks


def asset_text(asset: dict[str, Any]) -> str:
    extracted = asset.get("extractedTextPath")
    if not extracted:
        if asset["kind"] == "media":
            public_path = asset.get("publicPath") or asset["path"]
            return f"媒体素材：{asset['displayName']}\n\n路径：{public_path}\n\n该素材作为课程项目或教师补充演示使用。"
        return ""
    return (ROOT / extracted).read_text(encoding="utf-8", errors="replace")


def select_chunks(text: str, title: str, keywords: list[str], limit: int = 4) -> list[dict[str, str]]:
    chunks = split_markdown_chunks(text, title)
    if not keywords:
        return chunks[:limit]

    lower_keywords = [keyword.lower() for keyword in keywords]
    selected = [
        chunk
        for chunk in chunks
        if any(keyword in (chunk["title"] + "\n" + chunk["body"]).lower() for keyword in lower_keywords)
    ]
    if selected:
        return selected[:limit]
    return chunks[:limit]


def render_source_card(asset: dict[str, Any], keywords: list[str]) -> dict[str, Any]:
    text = asset_text(asset)
    if not text.strip():
        text = asset.get("excerpt", "")
    chunks = select_chunks(text, asset["displayName"], keywords, limit=5)
    markdown = []
    for chunk in chunks:
        markdown.append(f"#### {chunk['title']}\n\n{chunk['body'].strip()}")
    if not markdown:
        markdown.append(f"#### {asset['displayName']}\n\n这份材料暂时没有可直接展示的正文，适合回到原讲义或原题继续查阅。")

    return {
        "sourceId": asset["id"],
        "title": asset["displayName"],
        "path": asset["path"],
        "kind": asset["kind"],
        "language": asset["language"],
        "content": "\n\n".join(markdown).strip(),
        "excerpt": asset.get("excerpt", ""),
    }


def match_assets(manifest: list[dict[str, Any]], patterns: list[str]) -> list[dict[str, Any]]:
    matched: list[dict[str, Any]] = []
    seen: set[str] = set()
    for pattern in patterns:
        for asset in manifest:
            if fnmatch.fnmatch(asset["path"], pattern) and asset["id"] not in seen:
                matched.append(asset)
                seen.add(asset["id"])
    return matched


def is_student_visible_source(path: str) -> bool:
    return not any(fnmatch.fnmatch(path, pattern) for pattern in HIDDEN_SOURCE_PATTERNS)


SANDBOX_SPECS = [
    {
        "id": "shell-flow",
        "slug": "shell-flow",
        "title": "Shell 命令流模拟",
        "summary": "用一组常见命令组合模拟终端输入、命令执行和输出结果。",
        "conceptTargets": ["Shell", "命令行", "标准输入输出"],
        "limitations": ["不执行真实系统命令", "仅覆盖课程示例中的常见指令"],
        "initialState": {"command": "ls -l | grep .txt", "cwd": "/home/student"},
        "chapterSlugs": ["linux-cli", "shell-control"],
    },
    {
        "id": "permissions-map",
        "slug": "permissions-map",
        "title": "文件树与权限可视化",
        "summary": "在目录树和权限面板中理解八进制、符号权限与链接的区别。",
        "conceptTargets": ["文件系统", "权限", "硬链接", "符号链接"],
        "limitations": ["不修改真实文件", "仅模拟 owner/group/other 三组权限"],
        "initialState": {"octal": "754", "selectedNode": "report.txt"},
        "chapterSlugs": ["filesystem-permissions"],
    },
    {
        "id": "redirection-lab",
        "slug": "redirection-lab",
        "title": "重定向与管道数据流",
        "summary": "观察 stdin/stdout/stderr 如何在命令、文件和管道之间流动。",
        "conceptTargets": ["重定向", "管道", "错误输出"],
        "limitations": ["仅模拟文本流", "不执行真实 Shell 语法解析"],
        "initialState": {"stdin": "error line\nok line", "stdoutFile": "out.log"},
        "chapterSlugs": ["shell-control"],
    },
    {
        "id": "regex-playground",
        "slug": "regex-playground",
        "title": "Regex / awk Playground",
        "summary": "用课程中的样本文本测试正则、grep 风格匹配和 awk 风格字段处理。",
        "conceptTargets": ["正则表达式", "grep", "sed", "awk"],
        "limitations": ["awk 仅提供课程级别的字段和替换演示", "不运行外部进程"],
        "initialState": {"pattern": "[A-Z][a-z]+", "sample": "BoB EmpruntE TemporairemenT"},
        "chapterSlugs": ["text-processing"],
    },
    {
        "id": "syslog-rule-matcher",
        "slug": "syslog-rule-matcher",
        "title": "syslog 规则匹配器",
        "summary": "输入 facility、priority 与规则，观察消息会落到哪里。",
        "conceptTargets": ["syslog", "rsyslog", "logrotate"],
        "limitations": ["不修改真实配置文件", "规则语法覆盖课程里出现的主流写法"],
        "initialState": {"rule": "mail.notice /var/log/mail", "facility": "mail", "priority": "err"},
        "chapterSlugs": ["logs-rsyslog"],
    },
    {
        "id": "page-replacement",
        "slug": "page-replacement",
        "title": "页面置换算法模拟器",
        "summary": "比较 FIFO、LRU、Clock 三种算法在同一访问序列下的缺页情况。",
        "conceptTargets": ["分页", "虚拟内存", "页面置换"],
        "limitations": ["仅关注离散访问序列", "不模拟磁盘 I/O 延迟"],
        "initialState": {"reference": "1,5,2,5,1,4,1,5,3", "frames": 3, "algorithm": "FIFO"},
        "chapterSlugs": ["memory-paging"],
    },
    {
        "id": "scheduler-timeline",
        "slug": "scheduler-timeline",
        "title": "调度算法时间线模拟器",
        "summary": "输入进程到达时间和 CPU burst，观察 FCFS、SJF、RR 的调度时间线。",
        "conceptTargets": ["进程调度", "时间片", "响应时间"],
        "limitations": ["暂不模拟 I/O burst", "优先级调度采用课程简化模型"],
        "initialState": {
            "algorithm": "RR",
            "quantum": 2,
            "processes": [
                {"id": "P1", "arrival": 0, "burst": 5},
                {"id": "P2", "arrival": 1, "burst": 3},
                {"id": "P3", "arrival": 2, "burst": 4},
            ],
        },
        "chapterSlugs": ["sync-deadlock-scheduling"],
    },
    {
        "id": "resource-graph",
        "slug": "resource-graph",
        "title": "信号量 / 死锁资源图模拟器",
        "summary": "通过资源分配图理解互斥、等待环与死锁检测。",
        "conceptTargets": ["信号量", "临界区", "死锁"],
        "limitations": ["只模拟课程中的单实例 / 多实例资源图", "不执行真实并发线程"],
        "initialState": {"allocations": [["P1", "R1"], ["R2", "P2"]], "requests": [["P2", "R1"], ["P1", "R2"]]},
        "chapterSlugs": ["sync-deadlock-scheduling"],
    },
    {
        "id": "syncfs-decision",
        "slug": "syncfs-decision",
        "title": "SyncFS 决策模拟器",
        "summary": "基于 A/B/Journal 的状态推演课程项目同步器的动作选择。",
        "conceptTargets": ["文件同步", "冲突处理", "元数据比较"],
        "limitations": ["不真正复制文件", "仅模拟课程项目中的判定规则"],
        "initialState": {"a": "journal", "b": "modified", "contentEqual": False},
        "chapterSlugs": ["sync-deadlock-scheduling"],
    },
]


GLOSSARY = [
    {"id": "kernel", "term": "内核", "definition": "操作系统最底层的核心模块，负责管理 CPU、中断、内存与设备。", "chapterSlug": "os-intro"},
    {"id": "shell", "term": "Shell", "definition": "命令解释器，也是脚本语言，负责连接用户与操作系统。", "chapterSlug": "linux-cli"},
    {"id": "stdin", "term": "标准输入", "definition": "命令默认读取数据的入口，通常来自键盘或前序管道。", "chapterSlug": "shell-control"},
    {"id": "stdout", "term": "标准输出", "definition": "命令正常结果的输出通道，可重定向到文件或管道。", "chapterSlug": "shell-control"},
    {"id": "stderr", "term": "标准错误", "definition": "命令错误信息的输出通道，可单独重定向。", "chapterSlug": "shell-control"},
    {"id": "inode", "term": "inode", "definition": "文件系统中描述文件元数据的结构，文件名与 inode 分离。", "chapterSlug": "filesystem-permissions"},
    {"id": "fhs", "term": "FHS", "definition": "Filesystem Hierarchy Standard，Unix 文件系统层次结构标准。", "chapterSlug": "filesystem-permissions"},
    {"id": "hard-link", "term": "硬链接", "definition": "多个目录项指向同一个 inode，本质上共享同一份文件数据。", "chapterSlug": "filesystem-permissions"},
    {"id": "soft-link", "term": "符号链接", "definition": "保存目标路径的特殊文件，类似快捷方式。", "chapterSlug": "filesystem-permissions"},
    {"id": "grep", "term": "grep", "definition": "按模式搜索文本的经典 Unix 工具，可结合管道快速筛选。", "chapterSlug": "text-processing"},
    {"id": "awk", "term": "awk", "definition": "面向记录与字段的文本处理语言，适合统计、提取和转换。", "chapterSlug": "text-processing"},
    {"id": "copyleft", "term": "Copyleft", "definition": "要求衍生作品继续保持相同自由许可证的法律机制。", "chapterSlug": "free-software"},
    {"id": "syslog", "term": "syslog", "definition": "Unix/Linux 的日志收集与分发体系，用 facility 和 priority 描述消息。", "chapterSlug": "logs-rsyslog"},
    {"id": "logrotate", "term": "logrotate", "definition": "用于控制日志轮转、压缩、保留数量和创建权限的工具。", "chapterSlug": "logs-rsyslog"},
    {"id": "mount", "term": "挂载", "definition": "把文件系统接入统一目录树，使其可以通过路径访问。", "chapterSlug": "filesystem-admin"},
    {"id": "swap", "term": "交换空间", "definition": "当物理内存不足时，临时保存页面到磁盘的空间。", "chapterSlug": "filesystem-admin"},
    {"id": "module", "term": "内核模块", "definition": "可以按需加载、卸载的内核功能单元。", "chapterSlug": "filesystem-admin"},
    {"id": "process", "term": "进程", "definition": "正在执行的程序实例，是资源分配和调度的基本单位。", "chapterSlug": "os-intro"},
    {"id": "virtual-memory", "term": "虚拟内存", "definition": "为进程提供比物理内存更大且连续的地址空间抽象。", "chapterSlug": "memory-paging"},
    {"id": "mmu", "term": "MMU", "definition": "Memory Management Unit，负责虚拟地址到物理地址的转换。", "chapterSlug": "memory-paging"},
    {"id": "fifo", "term": "FIFO", "definition": "先入先出页面置换算法，可能出现 Belady 异常。", "chapterSlug": "memory-paging"},
    {"id": "lru", "term": "LRU", "definition": "最近最少使用页面置换算法，依据最近访问历史淘汰页面。", "chapterSlug": "memory-paging"},
    {"id": "semaphore", "term": "信号量", "definition": "用于互斥与同步的计数型并发原语。", "chapterSlug": "sync-deadlock-scheduling"},
    {"id": "deadlock", "term": "死锁", "definition": "进程相互等待资源而无法继续推进的状态。", "chapterSlug": "sync-deadlock-scheduling"},
    {"id": "banker", "term": "银行家算法", "definition": "通过安全性检查避免系统进入不安全状态的死锁避免算法。", "chapterSlug": "sync-deadlock-scheduling"},
]


CHAPTER_DEFS = [
    {
        "slug": "course-overview",
        "number": "01",
        "track": "总览",
        "title": "课程导论与学习路径",
        "summary": "先搭实操基础，再补理论框架，最后用复习与项目把整门课串成一条稳定学习路径。",
        "searchKeywords": ["课程导论", "学习路径", "实操线", "理论线", "操作系统课程"],
        "sections": [
            {
                "id": "study-route",
                "title": "这门课怎么学",
                "overview": "第一遍建议顺着章节走，先把命令行、文件系统、文本处理和系统管理的手感建立起来；第二遍再集中推演进程、内存、同步、死锁与调度；最后回到项目和复习页做综合巩固。",
                "keyPoints": [
                    "第 1-9 章是 Linux/Unix 实操线，重点是把命令、脚本、日志与系统管理跑通。",
                    "第 10-12 章是操作系统理论线，重点是把进程、内存、同步、死锁和调度连成完整框架。",
                    "每学完一章就用沙箱推演输入、状态变化和算法决策，再回到复习页巩固高频概念。",
                ],
                "pitfalls": ["一开始就陷进原讲义细节里，会打断整门课的主线节奏。"],
                "diagramIdeas": ["课程推进图：实操基础 -> 系统管理 -> OS 理论 -> 项目综合。"],
                "exercisePrompts": ["给自己制定一轮 12 章学习顺序，并说明哪些章节适合先看概念、哪些适合先动手。"],
                "sourcePatterns": ["README.md", "base-files/01_*", "base-files/15_*"],
                "keywords": ["学习路径", "课程计划", "导论", "Linux", "操作系统", "复习"],
                "sandboxIds": ["shell-flow"],
                "glossaryIds": ["kernel", "shell"],
            }
        ],
    },
    {
        "slug": "linux-cli",
        "number": "02",
        "track": "Linux/Unix 实操线",
        "title": "Linux 与命令行入门",
        "summary": "从发行版、Shell、本地环境、提示符与帮助系统开始，建立 Linux 学习入口。",
        "searchKeywords": ["Linux", "Shell", "命令行", "prompt", "man", "发行版"],
        "sections": [
            {
                "id": "linux-basics",
                "title": "Linux 发行版与本地运行环境",
                "overview": "这一部分回答“我在哪里运行 Linux、不同发行版有何差异、Shell 为什么是课程第一站”。",
                "keyPoints": [
                    "发行版共享同一内核，但在软件选择、默认配置、更新节奏上不同。",
                    "课程强调多种本地环境：双系统、U 盘、虚拟机、WSL、macOS Zsh。",
                    "Shell 既是交互界面，也是脚本语言，是进入 Linux 世界的第一道门。"
                ],
                "pitfalls": ["把 Shell 只理解成一组命令，而忽略它也是编程语言。"],
                "diagramIdeas": ["本地环境对比图：虚拟机、WSL、原生安装。"],
                "exercisePrompts": ["列出你当前机器上最适合本课程的 Linux 运行方式，并说明理由。"],
                "sourcePatterns": ["notes/01-02-*.md", "notes/01-03-*.md", "base-files/01_*", "sandbox/01-03-*"],
                "keywords": ["发行版", "Ubuntu", "Fedora", "Shell", "PowerShell", "prompt", "whatis", "apropos", "基础命令"],
                "sandboxIds": ["shell-flow"],
                "glossaryIds": ["shell"],
            }
        ],
    },
    {
        "slug": "filesystem-permissions",
        "number": "03",
        "track": "Linux/Unix 实操线",
        "title": "文件系统、路径、权限与链接",
        "summary": "把 Linux 的“万物皆文件”落到目录树、路径、权限、链接与文件操作的具体模型上。",
        "searchKeywords": ["文件系统", "权限", "inode", "路径", "链接"],
        "sections": [
            {
                "id": "tree-and-types",
                "title": "目录树、文件类型与路径模型",
                "overview": "从根目录、FHS、设备文件和绝对/相对路径入手，建立统一目录树的认知框架。",
                "keyPoints": [
                    "Linux 把硬盘、设备、虚拟文件系统都整合进一棵统一的目录树。",
                    "常见目录如 `/bin`、`/etc`、`/proc`、`/var` 的职责不同。",
                    "路径、挂载与设备文件决定了“你访问的到底是什么”。"
                ],
                "pitfalls": ["把目录当成“容器概念”而忽视它在 Unix 中本身也是文件。"],
                "diagramIdeas": ["根目录分层图、绝对路径与相对路径对照图。"],
                "exercisePrompts": ["解释 `/proc/filesystems`、`/dev/null` 和 `/home` 在文件系统认知中的不同角色。"],
                "sourcePatterns": ["notes/01-04-*.md", "notes/02-TD1.md", "notes/11.md", "base-files/02_*", "base-files/11_*", "base-files/12-02_*", "sandbox/01-04-*", "sandbox/02-TD1.sh"],
                "keywords": ["文件系统", "路径", "/bin", "/dev", "目录", "挂载", "inode", "文件类型", "绝对路径", "相对路径"],
                "sandboxIds": ["permissions-map"],
                "glossaryIds": ["inode", "fhs", "hard-link", "soft-link"],
            }
        ],
    },
    {
        "slug": "shell-control",
        "number": "04",
        "track": "Linux/Unix 实操线",
        "title": "重定向、管道、脚本与流程控制",
        "summary": "从 stdin/stdout/stderr 到变量、参数、条件、循环、函数和数组，构成 Shell 自动化主线。",
        "searchKeywords": ["重定向", "管道", "变量", "流程控制", "函数", "数组"],
        "sections": [
            {
                "id": "io-and-script",
                "title": "标准流、参数与脚本结构",
                "overview": "这一章把命令行操作升级为可复用脚本，理解输入输出流和脚本执行模型。",
                "keyPoints": [
                    "标准输入、标准输出、标准错误是 Shell 命令组合的基础。",
                    "位置参数、环境变量和 `read` 决定了脚本如何接收外部信息。",
                    "条件、循环、函数和数组把一次性命令扩展为自动化工具。"
                ],
                "pitfalls": ["忽略空格、引号、IFS 和子 Shell 语义，是 Shell 新手最常见的翻车点。"],
                "diagramIdeas": ["命令 -> stdout -> 管道 -> 下一条命令 的数据流图。"],
                "exercisePrompts": ["说明 `read`、`$@`、`shift`、`$?` 分别解决什么问题。"],
                "sourcePatterns": ["notes/01-05-*.md", "notes/01-06-*.md", "notes/01-07-*.md", "notes/01-08-*.md", "base-files/04_*", "sandbox/01-05-*", "sandbox/01-06-*", "sandbox/01-07-*", "sandbox/01-08-*", "sandbox/04-*"],
                "keywords": ["标准输入", "标准输出", "标准错误", "参数", "变量", "IFS", "read", "if", "while", "until", "for", "函数", "数组"],
                "sandboxIds": ["shell-flow", "redirection-lab"],
                "glossaryIds": ["stdin", "stdout", "stderr"],
            }
        ],
    },
    {
        "slug": "text-processing",
        "number": "05",
        "track": "Linux/Unix 实操线",
        "title": "文本处理与 Shell 题解",
        "summary": "把正则、grep、sed、awk 与一系列 TD 题解串成可迁移的文本处理能力。",
        "searchKeywords": ["grep", "sed", "awk", "正则", "which", "tree", "wc"],
        "sections": [
            {
                "id": "regex-and-tools",
                "title": "正则表达式、grep、sed 与 awk",
                "overview": "文本工具不只是命令记忆，而是“输入记录 -> 规则匹配 -> 结构化输出”的统一方法。",
                "keyPoints": [
                    "grep 负责筛选，sed 负责流编辑，awk 负责字段级计算与报表。",
                    "正则表达式是连接这些工具的共同语言。",
                    "TD3/TD4 把 which、tree、回文、wc、词频与替换问题变成组合式练习。"
                ],
                "pitfalls": ["直接把 JS/PCRE 语法照搬到 grep/awk，会踩在 BRE/ERE 与回溯引用差异上。"],
                "diagramIdeas": ["grep/sed/awk 分工矩阵。"],
                "exercisePrompts": ["比较 `grep` 和 `awk` 做筛选时的思维差别。"],
                "sourcePatterns": ["notes/06-*.md", "notes/07-*.md", "notes/08-TD3.md", "notes/09-TD4.md", "base-files/06-*", "base-files/07_*", "base-files/08_*", "base-files/09_*", "sandbox/06-*", "sandbox/08-*", "sandbox/09*"],
                "keywords": ["正则", "grep", "sed", "awk", "which", "tree", "wc", "回文", "substitution", "grobalogramme"],
                "sandboxIds": ["regex-playground"],
                "glossaryIds": ["grep", "awk"],
            }
        ],
    },
    {
        "slug": "free-software",
        "number": "06",
        "track": "Linux/Unix 实操线",
        "title": "自由软件与系统观念补充",
        "summary": "用 GPL、copyleft 与自由软件/开源软件差异补上 Linux 生态背后的法律与协作观念。",
        "searchKeywords": ["GPL", "copyleft", "自由软件", "开源软件"],
        "sections": [
            {
                "id": "gpl-basics",
                "title": "GPL、自由软件与协作文化",
                "overview": "Linux 不只是技术体系，也是以自由软件许可证和协作文化为基础的生态。",
                "keyPoints": [
                    "GPL 保障使用、研究、修改和再分发软件的自由。",
                    "Copyleft 要求衍生作品继续在同类条款下开放。",
                    "自由软件强调自由，开源软件更强调开发协作与源代码可见。"
                ],
                "pitfalls": ["把“源码公开”简单等同于“没有许可证约束”。"],
                "diagramIdeas": ["GPL 权利与义务双向图。"],
                "exercisePrompts": ["用 Linux 内核举例说明 GPL 为什么会影响商业使用方式。"],
                "sourcePatterns": ["notes/10.md", "base-files/10_*"],
                "keywords": ["GPL", "copyleft", "自由软件", "开源软件", "义务", "Linux 内核"],
                "sandboxIds": [],
                "glossaryIds": ["copyleft"],
            }
        ],
    },
    {
        "slug": "logs-rsyslog",
        "number": "07",
        "track": "Linux/Unix 实操线",
        "title": "日志、轮转、服务启动与 rsyslog",
        "summary": "围绕 syslog/rsyslog、logrotate、runlevel、cron 与远程日志构建系统运维视角。",
        "searchKeywords": ["syslog", "rsyslog", "logrotate", "runlevel", "cron"],
        "sections": [
            {
                "id": "syslog-stack",
                "title": "syslog / rsyslog 与日志轮转",
                "overview": "日志不是附属功能，而是系统观测、审计和故障排查的核心基础设施。",
                "keyPoints": [
                    "syslog 用 facility 与 priority 描述日志来源和严重级别。",
                    "rsyslog 在兼容 syslog 的基础上扩展了模块、性能与集中式采集能力。",
                    "logrotate 用于控制日志的大小、保留、压缩与权限。"
                ],
                "pitfalls": ["只记规则语法，不理解 facility / priority 匹配语义。"],
                "diagramIdeas": ["日志流：内核/服务 -> syslog/rsyslog -> 文件/远程服务器。"],
                "exercisePrompts": ["解释 `mail.notice` 与 `*.emerg` 这类规则是怎样匹配消息的。"],
                "sourcePatterns": ["notes/12-01.md", "notes/13-TD6.md", "notes/16.md", "base-files/12-01_*", "base-files/13_TD5-TD6_*", "base-files/13_TDs-31-et-32-Avec-Correction_*", "base-files/14_*", "base-files/16_*"],
                "keywords": ["syslog", "rsyslog", "logrotate", "facility", "priority", "runlevel", "cron", "remote", "warning", "alerte"],
                "sandboxIds": ["syslog-rule-matcher"],
                "glossaryIds": ["syslog", "logrotate"],
            }
        ],
    },
    {
        "slug": "filesystem-admin",
        "number": "08",
        "track": "Linux/Unix 实操线",
        "title": "文件系统管理、挂载、swap、归档、模块与网络",
        "summary": "从分区、mkfs、mount、swap、tar 到模块和网络配置，进入系统管理层面。",
        "searchKeywords": ["mount", "swap", "tar", "module", "route", "ifconfig"],
        "sections": [
            {
                "id": "storage-and-network",
                "title": "存储、归档、模块与网络配置",
                "overview": "这部分是 Linux 实操线的系统管理上半场：把文件系统、交换空间、模块和网络接口放到同一张运维地图里。",
                "keyPoints": [
                    "分区、mkfs、mount、fstab 是持久化存储的基本流程。",
                    "swap 文件 / 分区让系统在内存紧张时有缓冲区。",
                    "tar、压缩工具、模块、网络接口和路由配置共同构成基础运维能力。"
                ],
                "pitfalls": ["会背命令，却不知道哪些配置是临时生效、哪些写入系统文件才会持久。"],
                "diagramIdeas": ["存储层级图：磁盘 -> 分区 -> 文件系统 -> 挂载点。"],
                "exercisePrompts": ["比较使用 swap 文件和 swap 分区的差异。"],
                "sourcePatterns": ["notes/12-02.md", "notes/16.md", "base-files/12-02_*", "base-files/16_*"],
                "keywords": ["mkfs", "mount", "fstab", "swap", "tar", "compress", "modprobe", "ifconfig", "route", "netstat", "arp"],
                "sandboxIds": ["permissions-map"],
                "glossaryIds": ["mount", "swap", "module"],
            }
        ],
    },
    {
        "slug": "user-automation",
        "number": "09",
        "track": "Linux/Unix 实操线",
        "title": "用户与系统管理自动化",
        "summary": "用 `tr`、`useradd`、`userdel` 和批量脚本把系统管理任务自动化。",
        "searchKeywords": ["useradd", "userdel", "tr", "账户自动化"],
        "sections": [
            {
                "id": "account-automation",
                "title": "账户批量创建、删除与文本预处理",
                "overview": "课程在这里把字符处理、参数检查和系统命令调用合成一个真正的管理员脚本。",
                "keyPoints": [
                    "`tr` 常被用在登录名构造、大小写转换与字段清洗。",
                    "批量账户脚本不仅要创建账户，还要处理缺省参数、注释行与删除模式。",
                    "系统管理脚本的风险高于普通练习，必须特别关注参数验证和权限边界。"
                ],
                "pitfalls": ["把 macOS 命令和 Linux 管理命令混在一起而不做环境区分。"],
                "diagramIdeas": ["listing -> 解析 -> login -> useradd/userdel 流程图。"],
                "exercisePrompts": ["说明为什么登录名生成规则和注释行过滤都必须在脚本里显式处理。"],
                "sourcePatterns": ["notes/13-TD5.md", "base-files/13_LO03_*", "base-files/13_Admin_*", "sandbox/13.sh", "sandbox/13_Admin_*"],
                "keywords": ["useradd", "userdel", "tr", "listing", "login", "Usage", "Suppression"],
                "sandboxIds": ["shell-flow"],
                "glossaryIds": [],
            }
        ],
    },
    {
        "slug": "os-intro",
        "number": "10",
        "track": "操作系统理论线",
        "title": "操作系统导论、体系结构与进程基础",
        "summary": "从 OS 功能、层次结构、进程与内存基本概念进入理论主线。",
        "searchKeywords": ["操作系统导论", "体系结构", "进程", "内存"],
        "sections": [
            {
                "id": "os-structure",
                "title": "操作系统功能与层次结构",
                "overview": "理论线先回答“操作系统是什么、它替我们屏蔽了哪些硬件细节、它内部如何分层组织”。",
                "keyPoints": [
                    "操作系统提供虚拟机抽象，使程序无需直接管理硬件。",
                    "课程把 OS 分为内核、内存管理、I/O 管理、文件管理和资源分配等层次。",
                    "进程和内存是后续分页、同步、调度与死锁的起点。"
                ],
                "pitfalls": ["只把操作系统理解成“软件集合”，忽略它的抽象与资源管理角色。"],
                "diagramIdeas": ["OS 分层结构图。"],
                "exercisePrompts": ["解释为什么 `read` 这样的系统调用能让应用无须关心底层介质。"],
                "sourcePatterns": ["notes/15.md", "base-files/15_*"],
                "keywords": ["导论", "操作系统的功能", "结构", "进程", "内存", "kernel", "虚拟机"],
                "sandboxIds": [],
                "glossaryIds": ["kernel", "process"],
            }
        ],
    },
    {
        "slug": "memory-paging",
        "number": "11",
        "track": "操作系统理论线",
        "title": "内存、虚拟内存、分页与页面置换",
        "summary": "围绕 MMU、地址转换、分页机制和页面置换算法建立内存管理核心认知。",
        "searchKeywords": ["虚拟内存", "分页", "MMU", "FIFO", "LRU", "Clock"],
        "sections": [
            {
                "id": "paging-core",
                "title": "地址转换与页面置换",
                "overview": "课程从地址位划分、页表、MMU 与页面置换算法逐步搭出虚拟内存模型。",
                "keyPoints": [
                    "虚拟地址由页号和页内偏移组成，需要页表和 MMU 共同完成转换。",
                    "FIFO、LRU 与 Clock 是最常见的页面置换策略。",
                    "习题课把抽象算法落到具体地址和访问序列计算。"
                ],
                "pitfalls": ["只记算法名字，不手算缺页过程，就很难真正理解置换差异。"],
                "diagramIdeas": ["地址位分解图、页表映射图、三种页面置换状态对比图。"],
                "exercisePrompts": ["手动比较同一访问序列在 FIFO、LRU、Clock 下的缺页次数。"],
                "sourcePatterns": ["notes/15.md", "notes/17.md", "base-files/15_*", "base-files/17_*"],
                "keywords": ["虚拟内存", "分页", "MMU", "地址转换", "FIFO", "LRU", "时钟算法", "银行家算法", "页面替换"],
                "sandboxIds": ["page-replacement"],
                "glossaryIds": ["virtual-memory", "mmu", "fifo", "lru"],
            }
        ],
    },
    {
        "slug": "sync-deadlock-scheduling",
        "number": "12",
        "track": "操作系统理论线",
        "title": "同步、死锁、调度与课程项目",
        "summary": "把信号量、哲学家问题、死锁、银行家算法、调度算法和 SyncFS 课程项目收束成综合章节。",
        "searchKeywords": ["信号量", "死锁", "调度", "SyncFS", "银行家算法"],
        "sections": [
            {
                "id": "concurrency-and-scheduling",
                "title": "同步、死锁与调度算法",
                "overview": "这是课程中最需要把图、算法和运行过程一起理解的部分，适合边推演边画图。",
                "keyPoints": [
                    "信号量既可以实现互斥，也可以实现同步。",
                    "哲学家问题、图书馆问题和资源分配图帮助理解死锁条件、检测与恢复。",
                    "FCFS、SJF、RR、多级队列等调度算法要和响应时间、吞吐量等指标一起看。"
                ],
                "pitfalls": ["只从定义背诵死锁四条件，而不练习资源图与安全状态判断。"],
                "diagramIdeas": ["资源分配图、调度甘特图、信号量同步时序图。"],
                "exercisePrompts": ["比较 FCFS、SJF、RR 在同一批进程上的等待时间变化。"],
                "sourcePatterns": ["notes/15.md", "notes/17.md", "base-files/15_*", "base-files/17_*", "base-files/project/*", "base-files/from-teacher/*"],
                "keywords": ["信号量", "哲学家", "死锁", "银行家", "调度", "Round Robin", "SyncFS", "同步器", "冲突"],
                "sandboxIds": ["scheduler-timeline", "resource-graph", "syncfs-decision"],
                "glossaryIds": ["semaphore", "deadlock", "banker"],
            }
        ],
    },
]


def fallback_slug_for_path(path: str) -> str:
    prefix_map = {
        "README.md": "course-overview",
        "notes/01-02": "linux-cli",
        "notes/01-03": "linux-cli",
        "notes/01-04": "filesystem-permissions",
        "notes/02-": "filesystem-permissions",
        "notes/11": "filesystem-permissions",
        "notes/01-05": "shell-control",
        "notes/01-06": "shell-control",
        "notes/01-07": "shell-control",
        "notes/01-08": "shell-control",
        "notes/04-": "shell-control",
        "notes/06": "text-processing",
        "notes/07": "text-processing",
        "notes/08": "text-processing",
        "notes/09": "text-processing",
        "notes/10": "free-software",
        "notes/12-01": "logs-rsyslog",
        "notes/13-": "logs-rsyslog",
        "notes/12-02": "filesystem-admin",
        "notes/16": "filesystem-admin",
        "notes/15": "os-intro",
        "notes/17": "memory-paging",
        "base-files/project/": "sync-deadlock-scheduling",
        "base-files/from-teacher/": "sync-deadlock-scheduling",
        "base-files/10": "free-software",
        "base-files/12-01": "logs-rsyslog",
        "base-files/13_TD5-TD6": "logs-rsyslog",
        "base-files/13_TDs": "logs-rsyslog",
        "base-files/14": "logs-rsyslog",
        "base-files/12-02": "filesystem-admin",
        "base-files/16": "filesystem-admin",
        "base-files/13_LO03": "user-automation",
        "base-files/15": "os-intro",
        "base-files/17": "memory-paging",
        "base-files/06": "text-processing",
        "base-files/07": "text-processing",
        "base-files/08": "text-processing",
        "base-files/09": "text-processing",
        "base-files/11": "filesystem-permissions",
        "base-files/02": "filesystem-permissions",
        "base-files/04": "shell-control",
        "base-files/01": "linux-cli",
        "sandbox/01-03": "linux-cli",
        "sandbox/01-04": "filesystem-permissions",
        "sandbox/02-": "filesystem-permissions",
        "sandbox/01-05": "shell-control",
        "sandbox/01-06": "shell-control",
        "sandbox/01-07": "shell-control",
        "sandbox/01-08": "shell-control",
        "sandbox/04": "shell-control",
        "sandbox/06": "text-processing",
        "sandbox/08": "text-processing",
        "sandbox/09": "text-processing",
        "sandbox/13": "user-automation",
    }
    for prefix, slug in prefix_map.items():
        if path.startswith(prefix):
            return slug
    return "course-overview"


def build_chapters(manifest: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    manifest_by_id = {asset["id"]: asset for asset in manifest}
    coverage_links: list[dict[str, Any]] = []
    covered_source_ids: set[str] = set()
    chapters: list[dict[str, Any]] = []

    for index, chapter_def in enumerate(CHAPTER_DEFS):
        chapter_sources: list[str] = []
        sections: list[dict[str, Any]] = []

        for section_def in chapter_def["sections"]:
            matched_assets = match_assets(manifest, section_def["sourcePatterns"])
            source_ids = [asset["id"] for asset in matched_assets]
            chapter_sources.extend(source_ids)
            for source_id in source_ids:
                covered_source_ids.add(source_id)
                coverage_links.append(
                    {
                        "sourceId": source_id,
                        "chapterSlug": chapter_def["slug"],
                        "sectionId": section_def["id"],
                        "usage": "primary",
                    }
                )

            visible_assets = [asset for asset in matched_assets if is_student_visible_source(asset["path"])]
            source_pack = [render_source_card(asset, section_def["keywords"]) for asset in visible_assets]

            blocks: list[dict[str, Any]] = [
                {"type": "overview", "content": section_def["overview"]},
                {"type": "key-points", "items": section_def["keyPoints"]},
                {"type": "callout", "variant": "warning", "title": "易错点", "content": "；".join(section_def["pitfalls"])},
                {"type": "diagram-list", "items": section_def["diagramIdeas"]},
                {"type": "exercise-list", "items": [{"id": f"{section_def['id']}-exercise-{i}", "prompt": prompt, "answer": "", "difficulty": "medium"} for i, prompt in enumerate(section_def["exercisePrompts"], start=1)]},
            ]
            if source_pack:
                blocks.append({"type": "source-pack", "items": source_pack})
            blocks.append({"type": "sandbox-links", "ids": section_def["sandboxIds"]})

            sections.append(
                {
                    "id": section_def["id"],
                    "title": section_def["title"],
                    "anchor": section_def["id"],
                    "sourceIds": source_ids,
                    "glossaryIds": section_def["glossaryIds"],
                    "blocks": blocks,
                }
            )

        chapters.append(
            {
                "slug": chapter_def["slug"],
                "number": chapter_def["number"],
                "track": chapter_def["track"],
                "title": chapter_def["title"],
                "summary": chapter_def["summary"],
                "searchKeywords": chapter_def["searchKeywords"],
                "sourceIds": sorted(set(chapter_sources)),
                "sandboxIds": sorted({sandbox_id for section in chapter_def["sections"] for sandbox_id in section["sandboxIds"]}),
                "sections": sections,
                "review": {
                    "checklist": [item for section in chapter_def["sections"] for item in section["keyPoints"]],
                    "pitfalls": [item for section in chapter_def["sections"] for item in section["pitfalls"]],
                    "diagramIdeas": [item for section in chapter_def["sections"] for item in section["diagramIdeas"]],
                },
                "previousSlug": CHAPTER_DEFS[index - 1]["slug"] if index > 0 else None,
                "nextSlug": CHAPTER_DEFS[index + 1]["slug"] if index < len(CHAPTER_DEFS) - 1 else None,
            }
        )

    uncovered = [asset for asset in manifest if asset["id"] not in covered_source_ids]
    chapter_map = {chapter["slug"]: chapter for chapter in chapters}

    grouped_uncovered: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for asset in uncovered:
        grouped_uncovered[fallback_slug_for_path(asset["path"])].append(asset)

    for slug, assets in grouped_uncovered.items():
        if not assets:
            continue
        appendix_section_id = "appendix-sources"
        chapter = chapter_map[slug]
        visible_assets = [asset for asset in assets if is_student_visible_source(asset["path"])]
        section = next((item for item in chapter["sections"] if item["id"] == appendix_section_id), None)
        if section is None and visible_assets:
            section = {
                "id": appendix_section_id,
                "title": "课后延伸与原题材料",
                "anchor": appendix_section_id,
                "sourceIds": [],
                "glossaryIds": [],
                "blocks": [
                    {
                        "type": "overview",
                        "content": "如果你想回看老师原始题目、补充例子或更完整的讲义表达，可以在这里继续往下钻。",
                    },
                    {"type": "source-pack", "items": []},
                ],
            }
            chapter["sections"].append(section)

        for asset in assets:
            chapter["sourceIds"].append(asset["id"])
            coverage_links.append(
                {
                    "sourceId": asset["id"],
                    "chapterSlug": slug,
                    "sectionId": appendix_section_id,
                    "usage": "supporting",
                }
            )
            if section is not None and is_student_visible_source(asset["path"]):
                section["sourceIds"].append(asset["id"])
                source_pack = next(block for block in section["blocks"] if block["type"] == "source-pack")
                source_pack["items"].append(render_source_card(asset, []))

    for chapter in chapters:
        chapter["sourceIds"] = sorted(set(chapter["sourceIds"]))

    return chapters, coverage_links


def update_manifest_coverage(manifest: list[dict[str, Any]], coverage_links: list[dict[str, Any]]) -> None:
    covered_ids = {link["sourceId"] for link in coverage_links}
    for asset in manifest:
        asset["coverageStatus"] = "covered" if asset["id"] in covered_ids else "needs-review"


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Exit non-zero if any asset is not covered.")
    args = parser.parse_args()

    manifest = load_json(MANIFEST_PATH)
    chapters, coverage_links = build_chapters(manifest)
    update_manifest_coverage(manifest, coverage_links)

    for chapter in chapters:
        write_json(CHAPTERS_DIR / f"{chapter['slug']}.json", chapter)

    write_json(GLOSSARY_PATH, GLOSSARY)
    write_json(SANDBOXES_PATH, SANDBOX_SPECS)
    write_json(COVERAGE_PATH, coverage_links)
    write_json(MANIFEST_PATH, manifest)

    uncovered = [asset["path"] for asset in manifest if asset["coverageStatus"] != "covered"]
    if uncovered:
        print("Uncovered assets detected:")
        for path in uncovered:
            print(f" - {path}")
        if args.check:
            raise SystemExit(1)

    print(f"Wrote {len(chapters)} chapter files, {len(coverage_links)} coverage links.")


if __name__ == "__main__":
    main()
