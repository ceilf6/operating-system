# NodeJS/sandboxs/fs 对照 NodeJS 中的文件操作

# 沙盒环境
cd ./test-files

# 创建文件
touch file1
echo 1 >> file1

# 复制文件
cp ./file1 ./file1-copy

# 删除文件
rm ./file1

# 修改文件名
mv ./file1-copy ./重命名后文件名
mv ./重命名后文件名 ./esN

# 查看文件内容
cat ./esN
more ./esN # more 支持分页查看: 按回车翻行、按空格翻页

# 查看文件类型
file ./esN
# ./esN: ASCII text

cp ./esN ./esN2
echo 2 >> ./esN2

# 比较文件差异
## cmp 二进制逐字节比较，如果完全一致就什么都不输出
cmp ./esN ./esN2 
# cmp: EOF on ./esN

## diff 逐行比较，适合比较文本内容如代码的差异
diff ./esN ./esN2
# 1a2
# > 2

## comm 查看两个文件哪些行是独有的、哪些行是共有的
comm ./esN ./esN2
#                 1
#         2

# 退出沙箱
cd ../