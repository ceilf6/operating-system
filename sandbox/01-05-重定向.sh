# 输入重定向
# 链式处理 cat 拿到指定文件的内容后 > 写入到目标文件中（装饰器模式）
cat ./test-files/esN2 > ./test-files/esN2-copy

ls ./test-files >> ./test-files/out.log 2>> ./test-files/err.log