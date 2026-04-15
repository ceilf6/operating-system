# 正则表达式

正则表达式是国际标准，跨越语言

正则表达式是一个规则，用于验证字符串。

## 基础

1. 字面量匹配

规则中直接书写字面量字符

例如 abc 那么匹配串中必须出现 abc

1. 特殊字符

```
. 能匹配除换行符之外的所有字符

^ 匹配字符串的**开始**

$ 字符串的末尾
```

1. 转义符

```
\n 换行符

\r 回车符

\t 制表符

\s 任意空白符：空格、制表、换行
\S 非空白符：除了空白符外的任意字符
	（大写是小写的补集）

\b 单词边界：空格、换行、开头、结尾
\B 非单词边界

\d 数字字符：等于 [0-9]
\D 非数字字符

\w 字母、数字、下划线：等于 [A-Za-z0-9_]
\W 非：[^A-Za-z0-9_]

\u Unicode字符
```

转义符\ 可以将特殊字符转义

1. 字符集

编码范围

```
**[**字符范围**]**
```

匹配中文： `[\u4e00-\u9FA5]`

1. 量词

**前面的规则出现的次数**

```
* 任意次数

+ 至少1次

? 0或1次

{n} 匹配n个

{n,} 匹配>=n个

{n,m} 匹配n-m个
```

1. 或者 `|` 一个竖

## JS中的应用

js中，正则表达式表现为一个对象，该**对象**是通过**构造函数RegExp**

### 创建正则对象

1. 字面量模式
2. 构造函数模式

### 正则实例成员

- global
- ignoreCase
- multiline
- source
- test方法：验证某个字符串是否满足规则
- exec方法：execute，执行匹配，得到匹配结果。

> 正则表达式，默认情况下，适用贪婪模式
在量词后，加上?，表示进入非贪婪模式
> 

### 字符串对象中的正则方法

- split
- replace
- search
- match

## 进阶

### 捕获组

用小括号包裹的部分叫做捕获组，捕获组会出现在匹配结果中

捕获组可以命名，叫做具名捕获组

非捕获组

### 反向引用

在正则表达式中，使用某个捕获组，`\\捕获组编号`

### 正向断言(预查)

检查某个字符后面的字符是否满足某个规则，该规则不成为匹配结果，并且不称为捕获组

### 负向断言(预查)

检查某个字符后面的字符是否不满足某个规则，该规则不成为匹配结果，并且不称为捕获组

# 正则表达式

匹配模式，用于匹配符合特定规则的字符串

配合 grep 查找匹配规则的行

还有像 find 、 sed 等都支持使用

- 长度为1至8位的字母数字字符串（首位为字母）
    
    ```bash
    [A-Za-z][A-Za-z0-9]{0,7}
    ```
    
- 链接文件数量，即 ls -l 的首位是 l
    
    ```bash
    ls -l | grep '^l'
    ```
    
    拿到筛选后的行后通过行数得到目标数量
    
    ```bash
    | wc -l
    ```
    

## 基础

1. 字面量匹配

规则中直接书写字面量字符

例如 abc 那么匹配串中必须出现 abc

1. 特殊字符

```
. 能匹配除换行符之外的所有字符

^ 匹配字符串的**开始**

$ 字符串的末尾
```

1. 转义符

```
\n 换行符

\r 回车符

\t 制表符

\s 任意空白符：空格、制表、换行
\S 非空白符：除了空白符外的任意字符
	（大写是小写的补集）

\b 单词边界：空格、换行、开头、结尾
\B 非单词边界

\d 数字字符：等于 [0-9]
\D 非数字字符

\w 字母、数字、下划线：等于 [A-Za-z0-9_]
\W 非：[^A-Za-z0-9_]

\u Unicode字符
```

转义符\ 可以将特殊字符转义

1. 字符集

编码范围

```
**[**字符范围**]**
```

匹配中文： `[\u4e00-\u9FA5]`

在字符范围最前面添加 `^` 表示对字符范围取反

1. 量词

**前面的规则出现的次数**

> 是紧邻着的规则，也就是**前面一个**，像 \d[a-z]{3} 是字母出现3次，如果想要 数字+字母 的组合出现 3 次，
**用 ( ) 包裹**
> 

> 像 (bb){2} 是必须 bbbb 连着，如果需要“字符串中出现两次bb”，而不是必须连着的，可以 .*bb.*bb.* 通过 .* 实现任意
> 

```
*** 任意**次数

**+ 至少**1次（正）

? 0或1次

{n} 匹配n个

{n,} 匹配>=n个

{n,m} 匹配n-m个
```

1. 或者 `|` 一个竖

## 元字符

不表示字面，用于控制匹配模式

上面的特殊字符、字符集等等

## 场景

- 匹配首尾字母相同的字符串
    
    用分组的概念
    
    ```bash
    ^\([A-Za-z]\).*\1$
    ```
    
    注意 \( \) 以及 \1
    

![image.png](attachment:095e864a-7ab9-4488-8d6f-d894ed30475d:image.png)

![image.png](attachment:e5e88cdf-3b16-4ed5-b8cc-ec117117edf3:image.png)

配合管道化

![image.png](attachment:41021634-de09-470e-ac8c-3a13e247287d:image.png)

# Grep命令

在文本流中查找符合正则表达式的行，并将这些行输出到标准输出

```bash
grep [选项] 正则表达式 [文件]
```

## 选项

有：

- -c 统计符合匹配条件的行数
- -n 显示匹配的行号
- -l 列出匹配的文件名
- -v 反向匹配：输出不符合匹配条件的所有行
- -i 忽略大小写
- -w word强制整词匹配
- -E 强制将表达式解析为扩展正则表达式（等效于egrep命令）
    
    > **ERE 把很多本来要写成 \... 的特殊语法，变成可以直接写，例如像下面说到的分组**
    > 

一般来说，grep 会被包裹在 pipe管道中，接收前面的文本流，例如

```bash
cat /file | grep [0-9]
```

## 返回码

- 0：至少匹配到一行符合条件的内容
    
    > Shell 中基本用 0 表示成功，不同于其他语言的true
    不过业务状态码也基本用0表示的成功
    > 
- 1：未匹配到任何符合条件的内容
- 2：语法错误或文件不可访问（如权限不足、文件不存在）

## 场景

```bash
grep 'csh$' /etc/passwd 
# 匹配行尾为csh的行（/etc/passwd中使用csh Shell的用户）
```

```bash
ls -l | grep '^d' 
# 匹配行首为d的行（代表目录文件）
# 同理还可以匹配
# - 普通文件
# l 链接文件

ls -l | grep '^[^d]' 
# 匹配行首非d的行（非目录文件）
```

```bash
ls -l | grep '[0-9] Mar' 
# 匹配包含0-9数字后紧跟Mar的行（文件修改时间为3月）
```

## egrep

除了上面说的 “**ERE 把很多本来要写成 \... 的特殊语法，变成可以直接写”**

egrep 还提供很多额外功能

- r+：匹配表达式r出现一次或多次
- r?：匹配表达式r出现零次或一次
- r1 | r2：匹配表达式r1或者r2
- ( r )：可将正则表达式放入括号中，实现表达式分组
    
    ```bash
    egrep 'paul(e|ine)' /etc/passwd2
    # 匹配字符串paule或pauline
    ```
    

## 正则子表达式

```bash
grep '^\(.*\):.*:\1$' fich
```

str1::str1

**\( \)：分组**

> ERE / JS / Python 的正则直接用 ( ) 表示分组，但是 grep 是 BRE 需要用 \( \)
> 

### **\1**

表示：

> 必须再次出现“第 1 组刚才匹配到的内容”
> 

# sed命令

stream editor

[sed](https://www.notion.so/sed-3420f8d8d1fd80f7a4c6df01a2e4a54c?pvs=21) 

sed的命令默认从标准输入读取内容，也可应用于文件；处理结果会输出到标准输出

sed的核心功能是查找字符串或正则表达式的实例，并将其替换为另一个字符串或正则表达式。它**不会修改被处理的原文件**，仅将结果输出到标准输出

## 语法

可将sed命令写入单独的文件，称为「程序文件」

语法格式：

- sed -e 'sed命令' 待处理文件
- 当只有一条命令时，-e选项可省略
- sed -f 程序文件待处理文件

## 替换

```bash
sed 's/str1/str2/' fileName
```

将 str1 ⇒ str2

- 如果想要实现行内所有匹配项都全局替换
    
    加个 g global
    
    ```bash
    sed 's/str1/str2/g' fileName
    ```
    

## 指令文件

将在命令行书写的在文件中书写

例如在命令行中

```bash
sed -e 's/u/U/g' -e 's/a/A/g' fich
```

转入在 prog 文件中书写

```bash
s/u/U/g
s/a/A/g
```

然后到时候执行

```bash
sed -f prog fich
```

即可

## 配置

配合在 01-04 中的 sed 行号配置和标志位可以实现

- 仅替换第2行
    
    ```bash
    sed '2s/str1/str2/' fileName
    ```
    
- 替换第 2 到 5 行
    
    ```bash
    sed '2,5s/str1/str2/' fileName
    ```
    
- 忽略大小写：用标志位 i
    
    ```bash
    sed '2,5s/str1/str2/i' fileName
    ```
    
- 仅显示被修改的行
    
    ```bash
    sed '2,5s/str1/str2/p' fileName
    ```
    

```bash
sed '地址行号/匹配条件/命令' fileName
```

### 删除

从 s 替换 => d delete

```bash
# 删除最后一行
sed '$d' fileName
```

包含正则规则，和 替换 一样用 / / 包裹

```bash
# 删除空行
sed '/^$/d' fileName
```

## 显示

p print

前面 -n 防止默认输出

```bash
sed '/^str1/p' fileName
```

## 插入

i insert

```bash
sed '4i\str1' fileName
```

在第 4 行前插入 str1

## 追加

a add

```bash
sed '4a\str1' fileName
```

在第 4 行后追加 str1

> 像原先匹配是 / 要加入的就是 \
> 

再如

- 替换第 4 行所有内容为 str2
    
    ```bash
    sed '4c\str2' fileName
    ```
    
- 替换包含 str1 的行为 str2
    
    ```bash
    sed '/str1/c\str2' fileName
    ```
    

- 直接修改原文件
    
    ```bash
    sed -i 's/str1/str2/g' fileName
    ```
    
- 匹配从 str1 到 str2 的范围
    
    ```bash
    sed '/str1/,/str2/d' fileName
    ```
    
- 每隔 1 行显示（显示奇数行）
    
    ```bash
    sed -n '1~2p' fileName
    ```
    

## 配合正则表达式

- 显示以 str1 开头的行
    
    ```bash
    sed '/^str1/p' fileName
    ```
    
- 在每行开头添加 str1:
    
    ```bash
    sed 's/^/str1:/' fileName
    ```
    
    > 将旧的匹配到的 ^ 也就是开头，替换为新的 str1:
    > 
- 将 str1 用 ( ) 包裹
    
    ```bash
    sed 's/str1/(&)/' fileName
    ```
    
    > **&** 表示替换时，放入**本次匹配的内容**
    > 

![image.png](attachment:e8c002ee-c9a2-4d34-be99-8cf202192d58:image.png)

![image.png](attachment:e00fa7f8-e8f3-47fc-a045-30197cb25c07:image.png)

![image.png](attachment:dcca4355-8190-4fe8-9f8b-b658afcdf481:image.png)

![image.png](attachment:c1203b43-4d52-485f-808e-1f18c09bc1eb:image.png)

## 文件读写

本质就是

```bash
sed '规则r file2' file1
```

按照规则将 file1 =>插入到 file2

- 在 file1 的每行后面插入 file2 的内容
    
    ```bash
    sed 'r file2' file1
    ```
    
- 仅在 file1 的第 1 行后插入 file2 的内容
    
    ```bash
    sed '1r file2' file1
    ```
    
- 在 file1 最后一行后插入
    
    ```bash
    sed '$r file2' file1
    ```
    
- 在 file1 包含 str1 的行后插入 file2 的内容
    
    ```bash
    sed '/str1/r file2' file1
    ```
    
- 将 file1 的 2 到 5 行写入 file2
    
    ```bash
    sed -n '2,5w file2' file1
    ```
    
- 2 到最后一行
    
    ```bash
    sed -n '2,$w file2' file1
    ```