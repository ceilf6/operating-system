写入一个脚本文件就可以将重复进行复用、分享

通过位置参数（$0、$1、$*、$@、#等）实现「同一个脚本，处理不同数据」；

借助变量、环境变量和只读变量，将一次性实验脚本逐步演化为可维护的工具脚本。

“脚本（script）”指可由Shell执行的文件，包含Unix外部命令、内部命令和注释

在执行脚本时，会按顺序读取并执行脚本文件中的每一行

若Shell在某行检测到错误，将停止读取脚本并显示引发错误的命令所在行号

# 用户环境

包含：终端类型、提示符、字符删除键

由两个脚本创建

- /etc/profile 所有用户共享的全局配置文件
- /.bash_profile 位于用户主目录下的个人配置文件

# 执行

#! 放在脚本开头可以显式指定执行脚本的Shell

#!/bin/bash #此脚本由bash执行

![image.png](attachment:435c7ee0-ba2d-4285-9406-8ca3ff0727a2:image.png)

# 参数

在Shell术语中，参数指**任何可包含值的实体**。Shell区分三类参数：

- 变量：由名称标识（如a、PATH）
- 位置参数：由数字标识（如0、1、12）
- 特殊参数：由特殊字符标识（如#、?、$）

每类参数的赋值方式不同。获取参数值时，无论哪类，均需在引用前加$。

示例：$echo $PATH 显示变量PATH的值。

## 变量

变量由名称标识，名称是由字母、数字或下划线组成的字符串，且不能以数字开头。区分大小写。

变量可分为三组：

- 用户变量（如a、valeur）
- Shell预定义变量（如PS1、PATH、REPLY、IFS）
- Unix命令预定义变量（如TERM）

通常，用户变量名使用小写字母，而预定义变量名（Shell或Unix命令）使用大写字母。

### 赋值

```bash
变量名=值
```

注意不要空格画蛇添足，有空格就变成了三个字段识别为命令了

### 引用

```bash
$变量名
```

### 读取

获取输入

```bash
read 变量1 变量2 …
```

read命令读取整行，用 **字段分隔符 IFS** 分解为一个个字段，然后一次赋值给对应变量

默认情况下，IFS包含空格、制表符和换行符

修改 IFS 本质就是修改变量

```bash
IFS=
```

注意，当 read 出现在管道时，常常运行在子 shell 里，所以如果想保存的话不要写在管道里面

```bash
# 在不指定变量名时，默认保存到 REPLY 中
read
echo "REPLY $REPLY"
```

提示词

```bash
read -p "覆盖objFromUser: " objFromUser
```

set 显示所有变量

set 还能重新设置参数

```bash
set 'set1' 'set2'
echo "1 $1" # set1
echo "2 $2" # set2
```

unset 删除变量

```bash
echo "
=== set显示所有变量"
set

# unset 删除变量
unset vFromUser
echo "vFromUser $vFromUser"
```

### 常量

readonly

```bash
declare -r 变量名=值[变量名=值... ]
```

查看常量

```bash
declare -r
```

### 环境变量

export 命令会将变量放入环境中

```bash
export 变量名[=值]
```

env 读取所有环境变量

如果要读取变量就直接取变量名即可，因为 export 本质就是让进程环境记住

## 输入参数

- $0：脚本名或当前 shell 上下文名
- $1：第 1 个参数，这里是 111
- $2：第 2 个参数
- $#：参数个数
- 所有参数
    - *: 所有参数合并为一个字符串
    - @: 所有参数作为独立的个体 总共参数个数

```bash
echo "0 $0" # ./01-06-参数>变量.sh
echo "1 $1" # 111
echo "2 $2" # 222

echo "\$# $#" # 2 个数
echo "\$* $*" # 111:222
echo "\$@ $@" # 111 222

for i in "$@"
do

done
```

## 偏移参数

```bash
shift [n] #偏移n个参数
```

例如 shift 时默认偏移 1 个，那么会**丢弃 1** 的参数值，变量1的值被2替代，2被3替代，以此类推

```bash
echo "=== shift"
# 向左偏移1
shift 
echo "1 $1" # 222
echo "2 $2" # 333
echo "3 $3" # 444
echo "4 $4"

echo "=== shift 2 继续偏移2个"
shift 2
echo "1 $1" # 444
echo "2 $2"
echo "3 $3"
echo "4 $4"
```

## 消除歧义

引用时最好用

```bash
${ }
```

就像 模版字符串 一样插入

## 命令替换

像执行函数一样

用$()括起来的命令会被Shell执行，并将该命令输出到标准输出的结果替换到原位置。这些结果可以赋值给变量，或用于初始化位置参数

```bash
foo() {
  echo $((1 + 1))
}
fooRes=$(foo)
echo "foo res ${fooRes}"

pwdRes=$(pwd)
echo "pwd res ${pwdRes}"
```

### 被误当成选项

```bash
## 命令替换结果中含有 - 被误当成了外层命令的选项配置
# set $(ls -l ./配置交互智能提示.sh)
### 解决方案: 用 -- 阻止选项解析
set -- $(ls -l ./配置交互智能提示.sh)
echo "1 ${1}"
```

### 嵌套使用

```bash
## 命令替换的嵌套使用: 例如上面 foo 函数中的计算，还有如下面
set -- $(ls -l $(pwd)/配置交互智能提示.sh)
echo "1 ${1}"
```

### 获取脚本输出

```bash
scriptRes=$(bash ./test-files/script.sh)
echo "scriptRes ${scriptRes}"
```

## 返回码

预定义变量 ? 存储返回码，即上一条命令的返回

```bash
echo "who ${$(who)}" # a86198           console      Apr 10 21:36
who | grep 'a86198' # 要匹配的模式串
# 预定义变量 ? 存储返回码，即上一条命令的返回 
echo "? a86198登录了吗(0表示成功登录) $?" # 0

echo '成功echo'
echo "? $?" # 0
```