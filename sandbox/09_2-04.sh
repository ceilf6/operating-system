# bash ./09_2-04.sh ./test-files/09_2.txt

grep -E '\<([[:alnum:]_]+)\>.*\<\1\>.*\<\1\>' "$1"

echo "
=== awk"
# 感觉用 awk 统计更自然
awk '{
    delete cnt # 如果想换行的话不 delete 重置就好
    for (i = 1; i <= NF; i++) {
        cnt[$i]++
        if (cnt[$i] == 3) {
            print
            break
        }
    }
}' "$1"