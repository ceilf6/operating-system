# p=$(pwd)/test-files/13.txt

if [ $# -ne 1 ]
# test -ne
then
    if [ $# -eq 2 ] && [ $1 = "-del" ]
    # 7
    ## && 不能在 [] 里面
    then
        # userdel $3
        # 不是只删除一个，而是所有
        # awk -v target=$3 '{
        #     match = "<" $3 ">"
        #     if ( $3==$match )
        #         print ""
        #     else
        #         print
        # }' "$2" > tmp
        # mv tmp "$2"
        listing="$2"

        while IFS= read -r curLine || [ -n "$curLine" ]
        do
            set -- $curLine

            login="${3#<}"
            login="${login%>}"

            echo -n "Suppression du compte <$login> : "

            # 收集错误管道信息
            err=$(userdel -r "$login" 2>&1)

            if [ $? -eq 0 ]
            then
                echo "[OK]"
            else
                echo "[ERROR]"
                echo "$err"
            fi
        done < "$listing"
        exit 0
    else
        echo "Usage : ..."
        exit 1
    fi
fi

if [ ! -e "$1" ]
then
    echo "Fichier <….> inexistant"
    exit 1
fi

p=$1

# 用于重复测试的工具函数
reset(){
    echo "# 第一份名单
Dupont Charles
Martin Paul
# 第二份名单
Retraint Florent" > "$p"
}
reset

# awk '{
#     if ( $1 != "#" ){
#         a=tolower(substr($1,1,1)) tolower(substr($2,1,1))
#         print "<" $1 ">" " <" $2 ">" " <" a ">"
#     }
# }' "$p" > tmp

# awk '{
#     if ($1 != "#")
#         print "<" $1 "> <" $2 "> <" substr($1,1,1) substr($2,1,1) ">"
# }' "$p" | tr 'A-Z' 'a-z' > tmp
# # 要求用 tr 的话就不在 awk 里面转，将结果管道化到 tr 中处理
# mv tmp "$p"

awk '{
    # if ($1 != "#"){
    if ($0 !~ /^#/){
        login=substr($1,1,2) substr($2,1,2)
        print "<" $1 "> <" $2 "> <" login ">"
    }
}' "$p" | tr 'A-Z' 'a-z' > tmp
# todo: 这里的 tr 会导致全部变小写，
# 最好还是在 awk 内部通过 printf 筛选后管道化处理
mv tmp "$p"

curUID=1000

while read curLine || [ -n "$curLine" ]
do
    set -- $curLine
    field3="$3"
    loginLen=${#field3}
    targetLen=$((loginLen-2))
    login="${field3:1:targetLen}"

    nom="$1"
    lowerDir=$(printf '%s' "${nom:1:3}" | tr 'A-Z' 'a-z')
    homeDir="/home/NOM_${lowerDir}"

    useradd -u $curUID \
            -d $homeDir \
            -g "users" \
            -c "prénom NOM-TP ADMIN LINUX" \
            -s "/bin/bash" \
            -p "12345678" \
            $login

    ((curUID++))

    # macOS 上没有 useradd
    sudo sysadminctl -addUser "$login" \
                 -fullName "$nom" \
                 -password '12345678' \
                 -home "$homeDir" \
                 -shell /bin/bash

done < "$p"

# su - login
# pwd
# echo $HOME
# exit


# sudo sysadminctl -deleteUser dup
# sudo rm -rf /home/NOM_dup

# sudo sysadminctl -deleteUser mar
# sudo rm -rf /home/NOM_mar

# sudo sysadminctl -deleteUser ret
# sudo rm -rf /home/NOM_ret