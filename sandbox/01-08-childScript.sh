echo "=== foo"
foo 100 200 300

# 如果父脚本没有导出的话可以通过
# source ./01-08-Shell拓展、函数、数组.sh # 注意，这里形成循环引用-无限递归了
source ./01-08-cleanFatherScript.sh
echo "
=== foo2"
foo2 100 200 300