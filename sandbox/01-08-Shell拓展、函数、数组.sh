# 类型约束
## 其实也不算是 Java 和 TS 中的约束，只是为变量加上了一个整数属性，会影响赋值时的处理方式
declare -i v1
v1=1+2
echo "v1 $v1" # 3

v1Default=1+2
echo "v1Default $v1Default" # 1+2

# 内部命令进行计算
echo "\$((v1Default)) $((v1Default))" # 3

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

# for
for (( i=0 ; i<5 ; i++ )); do
  echo "i: $i"
done

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

## 入参
function sum {
  local sum=0
  for arg in "$@"; do # $@
    sum=$((sum + arg))
  done
  echo "sum: $sum"
}
sum 1 2 3 4 5

## 删除函数
unset -f sum
sum 1 2 3 4 5 # sum: command not found

## 函数返回码
function returnTest {
  return 1
  echo "不会走到"
}
returnTest
echo "\$?: $?" # 1

## 模块化导出
export -f foo # 那么当前的脚本得用 bash 启动，因为 export -f 是 bash 的特性，sh 是不支持的
bash ./01-08-childScript.sh

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