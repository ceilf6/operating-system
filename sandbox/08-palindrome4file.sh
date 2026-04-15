# bash ./08-palindrome4file.sh ./test-files/palindromeTestFile.txt

while read curLine || [ -n "$curLine" ]
do
    read -r -a arr <<< "$curLine"
    # -a 是 bash 特有的
    for str in "${arr[@]}"
    do
        res=$(bash ./08-palindrome.sh "$str")
        # 判断的应该是接收到的标准输出，而不是返回码
        if [ "$res" = "是回文字符串" ]
        then
            echo "$str"
        fi
    done
done < "$1"