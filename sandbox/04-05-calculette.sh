arg1=$1
arg2=$3
ex=$2
echo $(($arg1 $ex $arg2))

case $ex in
    "+")
        echo $(($arg1 + $arg2))
        ;;
    "-")
        echo $(($arg1 - $arg2))
        ;;
    # "*")
    \*)
        echo $(($arg1 * $arg2))
        ;;
    "/")
        if [ $arg2 -ne 0 ]
        then
            echo $(($arg1 / $arg2))
        else
            echo "除数不能为0"
        fi
        ;;
    *)
        echo "不支持的运算符"
        ;;
esac