dir="$1" # || "./"

fileCnt=0
sizeCnt=0

for file in "$dir"/*
do
    if [ -f "$file" ]
    then
        curFileSize=$(wc -c < "$file")
        # wc -c 可以直接拿到字节数
        # 且只能对 -f 普通文件
        ((fileCnt++))
        ((sizeCnt+=curFileSize))
    fi
done

if [ "$fileCnt" -eq 0 ]
# 防止除数为0
then
    echo 0
else
    echo $((sizeCnt / fileCnt))
fi