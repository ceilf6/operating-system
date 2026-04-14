foo2(){
    echo "入参"
    while [ $1 ]; do
        echo "$1"
        shift
    done
}