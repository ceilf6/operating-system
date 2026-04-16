# 类型约束

```bash
declare -i
```

为变量加上了一个整数属性，会影响赋值时的处理方式

因为 Shell 默认是将变量当成字符串处理的

在声明为整数时，会自动计算

```bash
# 类型约束
## 其实也不算是 Java 和 TS 中的约束，只是为变量加上了一个整数属性，会影响赋值时的处理方式
declare -i v1
v1=1+2
echo $v1 # 3

v1Default=1+2
echo $v1Default # 1+2
```

# 内部命令

```bash
# 内部命令进行计算
echo "\$((v1Default)) $((v1Default))" # 3
```

- 要获取算术表达式的值，可使用语法：$((算术表达式))
- 示例：echo $(( 7 * 3 ))
- 命令替换和参数替换可以出现在(( ))或$(( ))中，只要结果能解释为整数。
- 例如，$(( $(ls -l | wc -l) -1 ))中管道ls -l | wc -l的结果被当作数值处理

# 运算符

支持C语言中的所有运算符：

- a++和a--：后置自增、自减
- ++a和--a：前置自增、自减
- -a和+a：一元负号、正号
- a**b：乘方ab
- a*b、a/b和a%b：乘法、整数除法、取余

> 注意得在 $(( )) 算数上下文中
> 

```bash
# 运算符
arg2=2
arg3=3
echo "arg2++: $((arg2++))" # 2
echo "arg2--: $((arg2--))" # 3
echo "++arg2: $((++arg2))" # 3
echo "--arg2: $((--arg2))" # 2
echo "arg2*arg3: $((arg2 * arg3))" # 6
echo "arg2/arg3: $((arg2 / arg3))" # 0
echo "arg2%arg3: $((arg2 % arg3))" # 2 // 2 - 2/3*3
echo "arg2**arg3: $((arg2 ** arg3))" # 8
```

# for

```bash
for (( 起始 ; 条件 ; 终止 ))
do
	doWhatUWant
done
```

```bash
for (( i=0 ; i<5 ; i++ )); do
  echo "i: $i"
done
```

# 函数

```bash
# Function
function foo {
  echo "入参"
  while [ $1 ]; do
    echo "$1"
    shift
  done
}
foo 1 2 3

foo2(){
    echo "入参"
    while [ $1 ]; do
        echo "$1"
        shift
    done
}
foo2 4 5 6
```

## local

Shell的函数块中用 local 声明的是不是就像JS一样限制在了块级作用域中，在外面就访问不到了

`local -i` 声明变量

`local -a` 声明数组

```bash
## local
localTest(){
    local localTestVar=1
    echo "localTestVar: $localTestVar"
    localTestVar=2
    echo "localTestVar: $localTestVar"
    local -a arrayTest=(1 2 3)
    echo "arrayTest: ${arrayTest[*]}"
}
localTest
echo "localTestVar: $localTestVar" # 没有输出，说明 localTestVar 是局部变量
echo "arrayTest: ${arrayTest[*]}" # 没有输出，说明 arrayTest 是局部变量
```

## 入参

和使用命令一样

直接在 `函数名 参数1 参数2…`然后在里面 像访问命令行入参一样 通过 $ 访问

```bash
## 入参
function sum {
  local sum=0
  for arg in "$@"; do # $@
    sum=$((sum + arg))
  done
  echo "sum: $sum"
}
sum 1 2 3 4 5
```

## 删除函数

```bash
## 删除函数
unset -f sum
sum 1 2 3 4 5 # sum: command not found
```

## 函数返回码

也是到 return 就结束

```bash
## 函数返回码
function returnTest {
  return 1
}
returnTest
echo "\$?: $?" # 1
```

## 模块化导出

把函数导出到**当前 shell 的环境里**，让它后面启动的**子** bash 进程也能用这个函数

```bash
## 模块化导出
export -f foo # 那么当前的脚本得用 bash 启动，因为 export -f 是 bash 的特性，sh 是不支持的
bash ./01-08-childScript.sh
```

```bash
foo2(){
    echo "入参"
    while [ $1 ]; do
        echo "$1"
        shift
    done
}
```

```bash
echo "=== foo"
foo 100 200 300

# 如果父脚本没有导出的话可以通过
# source ./01-08-Shell拓展、函数、数组.sh # 注意，这里形成循环引用-无限递归了
source ./01-08-cleanFatherScript.sh
echo "
=== foo2"
foo2 100 200 300
```

# 数组

```bash
# 数组
declare -a array1
array1=(1 2 '3' '4' 5)

## 查看已定义的数组
declare -a
# declare -a array1='([0]="1" [1]="2" [2]="3" [3]="4" [4]="5")'

echo "array1[0] ${array1[0]}"

printf '<%s>\n' "${array1[*]}"
# 整个数组会变成一个字符串，通常用空格拼起来
# <1 2 3 4 5>

printf '<%s>\n' "${array1[@]}"
# 每个元素分别作为一个独立参数
# <1>
# <2>
# <3>
# <4>
# <5>

for i in "${array1[@]}"; do
  echo "i: $i"
done
# i: 1
# i: 2
# i: 3
# i: 4
# i: 5
```

# 目录文件摘要函数

```bash
#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUMMARY_ROOT="$SCRIPT_DIR/test-files/mock-summary"

summarize_directory() {
  local target_dir="$1"
  local file_count=0
  local subdir_count=0
  local recursive_file_count=0
  local entry

  if [ ! -d "$target_dir" ]; then
    echo "目录不存在: $target_dir"
    return 1
  fi

  for entry in "$target_dir"/*; do
    [ -e "$entry" ] || continue

    if [ -f "$entry" ]; then
      file_count=$((file_count + 1))
    elif [ -d "$entry" ]; then
      subdir_count=$((subdir_count + 1))
    fi
  done

  recursive_file_count=$(find "$target_dir" -type f | wc -l | tr -d ' ')

  echo "目录摘要: $target_dir"
  echo "当前层级普通文件数: $file_count"
  echo "当前层级子目录数: $subdir_count"
  echo "递归普通文件总数: $recursive_file_count"
  echo
}

summarize_directory "$SUMMARY_ROOT/alpha"
summarize_directory "$SUMMARY_ROOT/beta"
summarize_directory "$SUMMARY_ROOT/empty"

```

# 日志错误统计

```bash
#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/test-files/mock-logs"

shopt -s nullglob
log_files=("$LOG_DIR"/*.log)

if [ ${#log_files[@]} -eq 0 ]; then
  echo "未找到日志文件: $LOG_DIR"
  exit 1
fi

total_error_count=0

echo "开始扫描日志目录: $LOG_DIR"

for log_file in "${log_files[@]}"; do
  file_error_count=0

  while IFS= read -r line; do
    case "$line" in
      *ERROR*)
        file_error_count=$((file_error_count + 1))
        total_error_count=$((total_error_count + 1))
        ;;
    esac
  done < "$log_file"

  echo "$(basename "$log_file"): ERROR 行数 = $file_error_count"
done

echo "总 ERROR 行数 = $total_error_count"

```

# 重要目录磁盘使用情况

```bash
#!/usr/bin/env bash

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

important_dirs=(
  "$PROJECT_ROOT/base-files"
  "$PROJECT_ROOT/notes"
  "$PROJECT_ROOT/sandbox"
)

echo "检查重要目录磁盘使用情况"

for dir_path in "${important_dirs[@]}"; do
  if [ -d "$dir_path" ]; then
    usage=$(du -sh "$dir_path" 2>/dev/null | awk '{print $1}')
    echo "$(basename "$dir_path"): $usage ($dir_path)"
  else
    echo "目录不存在: $dir_path"
  fi
done
```