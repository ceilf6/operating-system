# bash ./09-03-countEachWord.sh ./test-files/words.txt

# 如果每个单词在循环中各自 awk 会导致不同进程 seen 无法共用
# for i in $(cat "$1")
# do
#     echo "$i" | awk '{
#         if (i in seen)
#             seen[i]+=1
#         else
#             seen[i]=0
#     }'
# done
# awk '{
#     for (i in seen)
#         print i seen[i]
# }'

# 直接通过 awk 读取文件，然后在 NF字段数 的范围内通过 $i 下标遍历
awk '{
    for (i = 1; i <= NF; i++) {
        seen[$i]++
    }
}
END {
    for (w in seen)
        print w, seen[w]
}' "$1"