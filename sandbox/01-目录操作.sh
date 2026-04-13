# 查看 cwd 当前工作目录
pwd
# /Users/a86198/Desktop/Lab/operating-system-app/sandbox

# 创建目录文件
mkdir ./test-dir

cd ./test-dir ; touch 1
cd ../

# rm ./test-dir/1
# rmdir ./test-dir
# 必须要空的，否则 rmdir: ./test-dir: Directory not empty

# 可以用 rm -r 递归删除
rm -r ./test-dir

mkdir ./test-files/test-dir

# 深度递归显示当前目录、及所有子目录的磁盘占用空间字节数
du ./

# 在当前目录查找文件，注意不能递归查找、而且后缀名也不可缺
find 01-基础命令.sh