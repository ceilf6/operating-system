p=$(pwd)/test-files/09_2-05.txt

awk '{
    for (i=1;i<=NF;i++){
        # if( !($i ~ /([A-Z])[a-z]*1/) )
        # awk 中不能用回溯引用 \1
        # 那么就只能先判断格式再 单独判断回溯
        if( !(($i ~ /^[A-Z][a-z]*[A-Z]$/ || $i ~ /^[A-Z]$/) && substr($i,1,1) == substr($i,length($i),1)))
            # 注意 $i ~ /^[A-Z]$/ 单个大写字母也是符合要求的
            exit 1
    }
}
# END { exit 0 } 
# END 会覆盖上面的，那么只需要在异常时返回 1 即可，正常退出就是 0
' "$p"

# 通过 返回码 传递判断结果状态
if [ "$?" = "0" ]
then
    echo "是grobalogramme"
else
    echo "不是grobalogramme"
fi

