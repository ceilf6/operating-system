# 利用管道化遍历命令结果

# 1. while
## declare -a arr
## -a 下标只能是数字
## -A 声明关联数组才能实现映射，但是这个要求 bash 版本
# declare -A arr

# ls -l | while read curLine
# do
#     set -- $curLine

#     # 跳过第一行 total
#     [ "$1" = "total" ] && continue

#     # if [ $4 in $arr ]
#     if [[ -v arr["$4"] ]]
#     then
#         (($arr["$4"]+=$5))
#     else
#         (($arr["$4"]=$5))
#     fi
# done

# for g in "${!arr[@]}"
# do
#     echo "$g ${arr[$g]}"
# done

# 2. awk
ls -l | awk '
NR > 1 { sum[$4] += $5 }
END {
    for (g in sum)
        print g, sum[g]
}'