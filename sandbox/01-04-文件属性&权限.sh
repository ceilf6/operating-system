ls -l ./ # long listing format
<<'COMMENT'
total 56
-rw-r--r--  1 a86198  staff   292 Apr 13 13:40 01-修改命令提示符.sh
-rw-r--r--  1 a86198  staff   578 Apr 13 14:15 01-命令提示.sh
-rw-r--r--  1 a86198  staff    69 Apr 13 13:57 01-基础命令.sh
-rw-r--r--  1 a86198  staff   633 Apr 13 15:20 01-文件属性.sh
-rw-r--r--  1 a86198  staff  2283 Apr 13 15:04 01-文件目录.sh
drwxr-xr-x  2 a86198  staff    64 Apr 13 15:21 test-files
-rw-r--r--  1 a86198  staff   590 Apr 13 15:00 智能提示自动补全而不是展示.sh
-rw-r--r--  1 a86198  staff   823 Apr 13 13:43 配置交互智能提示.sh

文件类型+权限 硬链接数 所有者 所属组 文件大小字节数 最后修改时间 文件名

# 第一个字段
## 第一列开头
- 普通文件
d 目录文件
l 符号链接
## 权限
第一个字段中除了第一列代表文件类型外的剩余9个字母
### 对象
其中三个为一段区分为三段从左到右分别表示
u(user)所有者权限 g(group)所属组权限 o(other)其他用户权限
如第一个就是
rw- r-- r--

### 权限类型
x excute 可执行
w write 可写
r read 可读

### 权限表示
和 React 中的权限设置一样，都是用的位运算
0 无任何权限
1 2**0 执行权限
2 2**1 写入权限
4 2**2 读取权限

COMMENT

cd ./test-files

ls -l ./
<<'COMMENT'
-rw-r--r--  1 a86198  staff   2 Apr 13 15:42 esN
-rw-r--r--  1 a86198  staff   4 Apr 13 15:42 esN2
drwxr-xr-x  2 a86198  staff  64 Apr 13 15:55 test-dir
COMMENT

chmod 520 esN
# 5=4+1读+可执行 r-x 
# 2写 -w- 
# 0无权限 ---
# -r-x-w----

chmod o+w esN
# -r-x-w--w-
# u(user)所有者权限 
# g(group)所属组权限 
# o(other)其他用户权限

# + 添加
# - 移除
# = 覆盖

# - 无权限
# x 可执行
# w 可写
# r 可读取

chmod g=rx esN
# -r-xr-x-w-

# 将用户主目录设置为私有目录（仅自己可访问）
chmod 700 -

ls -l ./