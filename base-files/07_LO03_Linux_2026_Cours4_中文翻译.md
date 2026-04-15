# 第4课：`awk` 命令

## `awk` 命令

- `awk` 是一个非常强大的命令，它本身就是一门编程语言，可以用于字符串查找，并对各行执行操作。  
  它非常适合用来提取信息、生成报告以及转换数据。
- 它的大部分语法借鉴自 C 语言。`awk` 这个名字来自它的三位创造者姓名的首字母（其中 `k` 来自 Kernighan，他也是 C 语言的发明者之一）。

## `awk` 命令的语法

```bash
awk [-F] [-v 变量=值] '程序' 文件
awk [-F] [-v 变量=值] -f 配置文件 文件
```

- 参数 `-F` 后面要跟字段分隔符  
  （例如 `-F:` 表示用 `:` 作为分隔符）
- 参数 `-f` 后面跟一个配置文件
- 参数 `-v` 用来定义变量，之后可以在程序中使用

示例：

```bash
awk -F: '{printf $1}' /etc/passwd
```

## 记录与字段

- `awk` 会把输入数据拆分成**记录**（record），再把记录拆分成**字段**（field）。
- 一条记录是由换行符分隔的一段输入字符串。
- 一个字段是由分隔符分隔的一段字符串。
- 在一条记录中，各字段分别用 `$1`、`$2`、……、`$NF` 表示。
- `$0` 表示整条记录。

## `awk` 程序

- `awk` 可以编写完整的程序，支持循环、条件判断等结构。
- 程序可以直接作为参数传给 `awk`（并放在引号中），也可以写在文件中，再通过 `-f` 选项提供给 `awk`。

示例：

```bash
awk '{print $1, $3 }' mon_fichier
```

其中：

- `{print $1, $3}` 是传递给 `awk` 的程序
- 它会在 `mon_fichier` 上执行

## 程序结构

```awk
BEGIN { action_begin }
selection_1 { action_1 }
selection_2 { action_2 }
...
END { action_end }
```

- `BEGIN {}` 和 / 或 `END {}` 可以省略
- 如果省略 `selection_1`，那么 `{ action_1 }` 会对文件的所有行执行
- 如果省略 `{ action_1 }`，那么所有满足 `selection_1` 的行都会被原样输出到标准输出

## 字段分隔

如果想使用空格和制表符以外的分隔符，可以使用 `-F分隔符`，或者在 `BEGIN {}` 中设置变量 `FS`。

示例：

```bash
echo '05/11/92' | awk -F/ '{ print $3 }'
# 输出：
# 92

echo '05/11/92' | awk 'BEGIN { FS="/" } { print $3 }'
# 输出：
# 92
```

## 字段分隔：另一个例子

```bash
more fich
# 内容：
# val=3, val=4,val=5
# 110 val=2, val = 'valeur'

awk 'BEGIN { FS = "val=" } { $1 = $1; print }' fich
```

输出：

```text
3, 4, 5
110 2, 'valeur'
```

这里把字符串 `val=` 当作字段分隔符。

## `awk` 的内部变量

- `$0`：当前记录（当前行）
- `$i`：当前记录中的第 `i` 个字段
- `NF`：当前记录中的字段数量
- `NR`：当前记录号（跨所有输入文件累计）
- `FNR`：当前文件中的记录号
- `FILENAME`：当前输入文件名
- `OFS`：输出字段分隔符

### 说明

- 如果变量 `A` 的值是 `3`，那么 `$A` 表示当前行的第 3 个字段
- `$NF` 表示当前行最后一个字段
- `$(NF-1)` 表示当前行倒数第二个字段
- 注意：在 `awk` 程序中，任何**没有用双引号包围的字符串**都会被当作变量

## 选择条件（模式）的描述

### 形式一：`/expression/`

所有匹配正则表达式 `expression` 的行都满足该选择条件。

### 形式二：`$i ~ /expression/`

如果第 `i` 个字段匹配正则表达式 `expression`，则该选择条件成立。

示例：

```awk
$1 ~ /^[0-9]/
$3 == "toto"
$NR == 10
```

## 选择条件的组合

- `NF == 3`  
  选择恰好有 3 个字段的行

- `/debut/ && $NF !~ /^[0-9]/`  
  选择包含 `debut`，并且最后一个字段不是以数字开头的行

- `(/un/ && /deux/) || /trois/`  
  选择同时包含 `un` 和 `deux` 的行，或者包含 `trois` 的行

- `! /exemple/`  
  选择不包含 `exemple` 的行

## `awk` 的变量与表达式

```awk
var = 3        # 赋值
var = var * 2  # 乘法
var += 5       # 加法
var++          # 自增
var--          # 自减
%              # 整数除法取余
==             # 相等
!=             # 不等
!              # 逻辑非
```

## `awk` 的语句

```awk
if (condition) { statement } [ else { statement } ]
while (condition) statement
do statement while (condition)
for (i = 1; i <= NF; i++)
for (index in array) statement
break      # 跳到循环之后的下一条语句
continue   # 进入下一次循环迭代
exit [n]   # n 会传给启动 awk 的 shell，作为 $? 的值
```

## `awk` 的内置函数

### `print`

- 用于输出结果
- 每执行一次 `print` 都会自动换行

示例：

```bash
echo '12345 7 9' | awk '{ print; print $1, $2; print $1 $2 }'
```

输出：

```text
12345 7 9
12345 7
123457
```

### `printf`

- 类似 `print`，但输出是格式化的
- 第一个参数必须是一个格式字符串，用于说明后续参数如何输出

示例：

```bash
echo '123.456 111 un deux' | awk '{ printf "%3.2f, %d, %5s, %s\n", $1, $2, $3, $4 }'
```

输出：

```text
123.46, 111,    un, deux
```

- `printf` 只有在格式字符串中显式写出 `\n` 时才会换行

### `sprintf`

```bash
echo '123.456 12 12.123456' | awk '{ res = sprintf("%3.2f, %3.2f, %3.2f", $1, $2, $3); print "res=", res }'
```

输出：

```text
res= 123.46, 12.00, 12.12
```

### `length`

- 返回整行长度，或者返回参数指定字段的长度

示例：

```bash
echo '12345 789' | awk '{ print length, length($1) }'
```

输出：

```text
9 5
```

### `index`

- 返回子串在字符串中的位置

示例：

```bash
echo 'T_SPE_CTXP_DF1' | awk '{ print index($1, "SPE") }'
```

输出：

```text
3
```

### `substr`

- 提取字符串的一部分

示例：

```bash
echo 'T_SPE_CTXP_DF1' | awk '{ print substr($1, 7, 4) }'
```

输出：

```text
CTXP
```

### `sub`

- 替换第一次出现的匹配项

示例：

```bash
echo 'T_SPE_CTXP_DF1' | awk '{ sub("DF[012]", "DFL", $1); print $1 }'
```

输出：

```text
T_SPE_CTXP_DFL
```

### `gsub`

- 替换所有匹配项，而不只是第一次

### `match`

- 与 `index` 类似，但可以使用正则表达式，而不只是固定字符串

### `toupper` 与 `tolower`

- 分别将字符串转成大写和小写

示例：

```awk
tolower($1) == "toto"
```

表示测试第一个字段是否等于 `toto`，不区分大小写，例如 `TOTO`、`ToTo` 等都算匹配。

### `split`

```bash
echo 'T_SPE_CTXP' | awk '{ n = split($1, tab, "_"); print "nombre de sous-champs:", n; for (i = 1; i <= n; i++) print "No", i, "=", tab[i]; }'
```

输出：

```text
nombre de sous-champs: 3
No 1 = T
No 2 = SPE
No 3 = CTXP
```

### `sqrt`

- 计算 `x` 的平方根（算术函数示例）

### `system`

- 执行参数中给出的命令，并返回该命令的退出码
- 这使得 `awk` 程序中可以调用其他命令，甚至调用 shell

示例：

```awk
system("ls " $1)
```

## `awk` 程序示例题

- 编写一个 `awk` 脚本，显示长度超过 80 个字符的行
- 编写一个 `awk` 脚本，显示恰好包含两个字段的行
- 编写一个 `awk` 脚本，显示每一行的第二个字段
- 编写一个 `awk` 脚本，显示第 3 行的第 2 个单词

- 编写一个 `awk` 脚本，将前两个单词逆序输出，并用逗号分隔
- 编写一个 `awk` 脚本，显示用户 `guest` 的密码
- 编写一个 `awk` 脚本，显示从第 8 行到最后一行的内容
- 编写一个 `awk` 脚本，提取第 2 行到第 4 行

- 编写一个 `awk` 脚本，为文件的每一行编号
- 编写一个 `awk` 脚本，显示 `ls -l` 输出中最大的文件名
- 编写一个 `awk` 脚本，统计文件中非空行的数量
- 编写一个 `awk` 脚本，删除空行

- 编写一个 `awk` 脚本，将逗号替换为空格
- 编写一个 `awk` 脚本，将文件中的小写字母转换为大写
- 编写一个 `awk` 脚本，删除文件单词之间的所有空格
- 编写一个 `awk` 脚本，统计包含字符串 `titi` 的行数

- 编写一个 `awk` 脚本，对当前目录中所有扩展名为 `.c` 的文件，输出：
  `文件名: taille = 文件大小`
  并给出这些文件大小的总和
