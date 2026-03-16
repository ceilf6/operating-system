# Bash 文件同步器实现说明

这个实现对应题目里给出的两级要求：

- **基础同步器**：比较 A、B 与上次同步日志，决定复制方向或报告冲突。
- **增强同步器**：当双方都改过时，额外比较内容；如果内容相同，则尽量只同步元数据，而不是误报冲突。

## 文件

- `syncfs.sh`：主程序
- `README_syncfs.md`：使用说明

## 支持的行为

1. **递归遍历两个目录树**，不依赖文件在目录中的出现顺序。
2. 比较以下元数据：
   - 类型
   - 权限(mode)
   - 大小(size)
   - 最后修改时间(mtime)
3. 使用日志文件记录上一次成功同步的普通文件。
4. 如果双方内容不同且都不符合日志，则报告 **content conflict**。
5. 如果双方内容相同但元数据不同，则尽量按题意处理为：
   - 同步成功；或
   - 报告 **metadata-only conflict**。
6. 支持：
   - `--dry-run` 预演
   - `--interactive` 交互式冲突解决
   - `--diff` 对文本冲突显示 `diff -u`

## 日志格式

日志默认保存在：

```bash
$HOME/.synchro.tsv
```

格式示例：

```text
#SYNCFSv1
A	/abs/path/to/A
B	/abs/path/to/B
docs/a.txt	file	644	120	1710524000
src/main.c	file	644	932	1710524100
```

## 用法

```bash
./syncfs.sh DIR_A DIR_B
./syncfs.sh -l journal.tsv DIR_A DIR_B
./syncfs.sh --dry-run DIR_A DIR_B
./syncfs.sh --interactive --diff DIR_A DIR_B
```

## 返回码

- `0`：同步完成，且没有阻塞性冲突
- `1`：同步完成，但存在冲突
- `2`：参数错误

## 设计说明

### 1. 复制规则

程序实现了题目里的核心规则：

- 一边是目录、一边是普通文件：冲突
- 两边都是目录：递归处理
- 两边普通文件且元数据一致：成功
- A 符合日志、B 不符合：复制 `B -> A`
- B 符合日志、A 不符合：复制 `A -> B`
- 双方都不符合日志：冲突；但在增强模式下先比较内容

### 2. 缺失文件

原 PDF 对“某个路径只存在于一边”的情况没有完全展开。这里采用了**合理实现**：

- 如果路径只存在于一边，且另一边缺失：
  - 在首次同步或现存一侧符合日志时，会把现存一侧复制到缺失一侧
  - 否则记为冲突

这样可以更贴近“让两棵目录树尽量一致”的目标。

### 3. 元数据冲突

若两个普通文件内容相同，但双方元数据都和日志不一致，则报告：

```text
metadata-only-conflict
```

这正对应题目 1.3 的最后一种情况。

## 简单测试

```bash
mkdir -p A B
printf 'hello\n' > A/test.txt
./syncfs.sh -l journal.tsv A B

# 修改 B 后再次同步
printf 'hello world\n' > B/test.txt
./syncfs.sh -l journal.tsv A B
```

## 可继续扩展

- 更漂亮的 TUI/菜单式冲突解决
- 删除传播策略
- 更严格的并发修改检测
- 对符号链接、设备文件等特殊文件的支持
- 把 journal 改为更健壮的 JSON / NUL-safe 编码
