#!/usr/bin/env bash

filePath=$1
cnt1=0
cnt2=0
if [ -r "$filePath" ];then
    while read curLine
    do
        # 1. 通过 set 命令将当前行的单词分割成一个个参数
        set $curLine
        ((cnt1+=$#))

        # 2. read
        read -r -a arr <<< "$curLine"
        cnt2=$((cnt2+${#arr[@]}))

    done < "$filePath"
    echo "文件中单词数量 $cnt1"
    echo "文件中单词数量 $cnt2"
else
    echo "文件不可读"
fi