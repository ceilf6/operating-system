# bash ./09-04-rev.sh '1 2 3 4 sas fsasd sasa
# 213dsdsccx
# sas sas 23asa
# 43 fsdcsk ks'

ans=""

while read curLine
do
    curRevLine=""
    for w in $curLine
    do
        curRevLine="$w $curRevLine"
    done
    curRevLine=${curRevLine% }   # 去掉末尾多余空格

    ans="$curRevLine
$ans"
# 注意 Shell 不会帮你做空白折叠，自己处理缩进
done <<< "$1"

echo "$ans"