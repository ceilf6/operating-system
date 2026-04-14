testFilePath1=$(pwd)/test-files
testFilePath2=$(pwd)/test-files/script.sh
testFilePath3=../noFile

# 函数本质上就是把一组命令起了一个名字
# 那么执行等等都是当成命令对待
testFileFunc(){ # 1){
    # Shell 函数不在定义处写形参名，参数是通过函数体里的 $1、$2 ... 取的
    if test -f "$1" # 为防止路径中的空格影响执行，最好加 ""
    then
        echo "$1 是普通文件"
        fileRes=$(file "$1")
        echo "$1 文件详细信息 $fileRes
        "
    elif test -d "$1"
    then
        echo "$1 是目录文件"
        echo "进入目录 $1
        "
    else
        echo "$1 不存在
        "
    fi
}
# Shell的函数调用是通过 "" 命令行方法传入参数
testFileFunc "$testFilePath1"
testFileFunc "$testFilePath2"
testFileFunc "$testFilePath3"

# && 和 ||
## 注意不是用于逻辑中判断，而是用于逻辑分支执行
## 运算符 && 和 || **根据前一条命令的返回码决定是否执行后一条命令。**
echo "输出成功" && echo "前面成功就执行"
test -f $testFilePath1 || echo "前面失败就执行"
# file1不是普通文件
<< 'COMMENT'
输出成功
前面成功就执行
前面失败就执行
COMMENT

# test
## file文件测试
echo "
=== 文件测试"
test -f "$testFilePath2" && echo "test -f true" || echo "test -f false"
test -e "$testFilePath2" && echo "test -e true" || echo "test -e false"
test -r "$testFilePath2" && echo "test -r true" || echo "test -r false"
test -w "$testFilePath2" && echo "test -w true" || echo "test -w false"

## 字符串测试
echo "
=== 字符串测试"
test -z "" && echo "test -z true" || echo "test -z false"
test -n "" && echo "test -n true" || echo "test -n false"
test '1' = '1' && echo "test = true" || echo "test = false"
test '1' != '1' && echo "test != true" || echo "test != false"

## 数值测试
echo "
=== 数值测试"
arg1=1
arg2=2
test $arg1 -eq $arg2 && echo "等于 \$arg1 -eq \$arg2 true" || echo "等于 \$arg1 -eq \$arg2 false"
test $arg1 -ne $arg2 && echo "不等于 \$arg1 -ne \$arg2 true" || echo "不等于 \$arg1 -ne \$arg2 false"
test $arg1 -lt $arg2 && echo "小于 \$arg1 -lt \$arg2 true" || echo "小于 \$arg1 -lt \$arg2 false"
test $arg1 -gt $arg2 && echo "大于 \$arg1 -gt \$arg2 true" || echo "大于 \$arg1 -gt \$arg2 false"
test $arg1 -le $arg2 && echo "小于等于 \$arg1 -le \$arg2 true" || echo "小于等于 \$arg1 -le \$arg2 false"
test $arg1 -ge $arg2 && echo "大于等于 \$arg1 -ge \$arg2 true" || echo "大于等于 \$arg1 -ge \$arg2 false"

## 逻辑运算符
# if test -f "$testFilePath2" && test -r "$testFilePath2"
if test -f "$testFilePath2" -a -r "$testFilePath2"
then
    echo "$testFilePath2 是一个可读的普通文件"
else
    echo "$testFilePath2 不是一个可读的普通文件"
fi

# if test -f "$testFilePath2" || test -r "$testFilePath2"
if test -f "$testFilePath2" -o -r "$testFilePath2"
then
    echo "$testFilePath2 是一个普通文件或者可读的文件"
else
    echo "$testFilePath2 不是一个普通文件也不可读"
fi

# case分支处理
testFilePath4=$(pwd)/test-files/script2.sh
touch "$testFilePath4"
echo "是否要删除文件 $testFilePath4 ?(y删除 n不删)"
read input
case $input in
    y|Y)
        echo "删除文件 $testFilePath4"
        rm "$testFilePath4"
        ;;
    n|N)
        echo "不删除文件 $testFilePath4"
        ;;
    *)
        echo "输入错误，请输入 y/Y 或 n/N"
        ;;
esac

# 循环
## while
## 将输入逐步写入一个文件
outputFilePath=/Users/a86198/Desktop/Lab/operating-system-app/sandbox/test-files/out.log
input=""
while [ "$input" != "exit" ]
# 注意空格
do
    echo "$input" >> "$outputFilePath"
    echo "请输入内容, 输入exit退出"
    read input
done

## until
input=""
until [ ! "$input" != "exit" ]
# 注意空格
do
    echo "$input" >> "$outputFilePath"
    echo "请输入内容, 输入exit退出"
    read input
done

## for
for i in 1 2 3 4 5
do
    echo "for循环第 $i 次"
done

for i in $(ls './test-files')
do
    if test -d "./test-files/$i"
    then
        echo "$i 是目录"
    elif test -f "./test-files/$i"
    then
        echo "$i 是文件"
    else
        echo "$i 不存在" # 软链接是不存在的分支，因为没有实际文件
    fi
done

# break 和 continue
for i in 1 2 3 4 5
do
    if test $i -eq 2 ; then
        echo "跳过 $i"
        continue
    fi
    if test $i -eq 4 ; then
        echo "退出循环 $i"
        break
    fi
    echo "for循环第 $i 次"
done
