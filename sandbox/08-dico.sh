# bash ./08-dico.sh 5 i2 u4

targetPath=$(pwd)/test-files/words.txt

length=$1

# 下面拼接要求的是升序输入，可以手动排序
# sortedArgs=$(printf '%s\n' "$@" | sort -k1.2n)

cur=0 # 当前到的地方
temp="^" # 模式串
shift 1 # 或者 for i in "${@:2}"
for i in "$@"
do
    # 和 substr 一样 ${str:start:length} 最后是长度
    chr="${i:0:1}"
    num="${i:1}" # 剩下的就是数字，不声明长度默认取到末尾
    leftLen=$((num-cur-1))
    # $(()) 算数上下文中就不用 $ 声明变量了
    temp="$temp.\{$leftLen\}$chr"
    # 注意 grep 默认是基础正则 BRE，需要对 { } 进行转义 \{ \} 
    # 或者下面用 grep -E
    cur="$num" # 更新位置
done

# 最后一段用来限制长度
leftLen=$((length-cur))
temp="$temp.\{$leftLen\}$"

# grep "$temp" "$targetPath" # 只对行处理
# grep -Eo '[[:alpah]]+' 可以拿到所有字母单词
grep -Eo '[[:alpha:]]+' "$targetPath" | grep "$temp"