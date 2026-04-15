filePath=$1

lineCnt=0
wordCnt=0
chrCnt=0

while read curLine || [ -n "$curLine" ]
do
    ((lineCnt++))
    set -- $curLine
    ((wordCnt += $#))
    for w in "$@"
    do
        ((chrCnt += ${#w}))
    done
done < "$filePath"

echo "$lineCnt" "$wordCnt" "$chrCnt"