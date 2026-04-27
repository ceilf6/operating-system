p=$(pwd)/test-files/09_2.txt

# awk '{
#     for(i=1;i<=NF;i++)
#         if ($i ~ /.*/(./)/1{2,}/)
#             print $i
# }' "$p"
# awk 要用 /i+/ 还不如 grep
echo "=== 1 - grep"

# grep '\(.\)\1\{2,\}' "$p"
# 先拆为一个个单词（包不包含下划线都行）
grep -Eo '[[:alnum:]_]+' "$p" | grep '\(.\)\1\{2,\}'

echo "
=== 1 - awk"
# 或者手动判断连续，但是本题应该不是希望手动判断
awk '{
    for (i = 1; i <= NF; i++) {
        word = $i
        cnt = 1
        found = 0

        for (j = 2; j <= length(word); j++) {
            if (substr(word, j, 1) == substr(word, j - 1, 1)) {
                cnt++
                if (cnt >= 3) {
                    found = 1
                    break
                }
            } else {
                cnt = 1
            }
        }

        if (found)
            print word
    }
}' "$p"

# 2
echo "
=== 2"
## grep 配合 管道化
grep 'a' "$p" | grep 'e' | grep 'i' | grep 'o' | grep 'u'

awk '/a/ && /e/ && /i/ && /o/ && /u/' "$p"

# 3
echo "
=== 3"
# awk "{
#     if ($0 ~ //)
# }" "$p"

grep '^.*\b.*\b.*$' "$p"

# 4
echo "
=== 4"
grep -Eo "[[:alnum:]_]+" "$p" | grep '.\{10,\}'