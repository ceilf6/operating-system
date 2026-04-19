# 通知栏
- [时钟轮转法命中时不需要移动指针](https://github.com/ceilf6/operating-system/discussions/1)
- LRU 缓存可以看 [146 双向链表LRU缓存](https://www.notion.so/146-LRU-3130f8d8d1fd8005b82ec34f5fdea2cc?pvs=21)
- 目录
  - [base-files](./base-files)下是课件等资料及翻译
  - [sandbox](./sandbox)下存放了各个课件以及TD中有代表性的脚本，其中由于部分题目答案不是很满意，于是进行了重构
  - [notes](./notes)下是个人笔记
  > 三个目录下面在不同课时通过前缀区分进行一一对应，这里的前缀取值是根据老师发文件的batch批次，没有实际意义、仅用于区分 
  
  > base-files 中的部分中文翻译和 notes 内容重合较高，我用 symlink 优化了，这部分文件根据展示的 link 路径去 notes 中找对应文件即可

- [CN-LO03_Silde_Cours_3&4](./base-files/06_CN-LO03_Silde_Cours_3&4.pdf) 只翻了 课3 ，课4 可以看 [Cours4_中文翻译](./base-files/07_LO03_Linux_2026_Cours4_中文翻译.md)

# 链接
> 来自 [Lab](https://github.com/ceilf6/Lab) 的指针记录，方便及时回溯

- [通过递归实现 Shell tree 命令 - local 存储传下的缩进数等、防止污染; basename 拿到文件名; ""防止空白折叠](https://github.com/ceilf6/Lab/commit/31e33f331961345ca1f075dfedd0916954578be8)

- [通过位运算(八进制)管理权限](https://github.com/ceilf6/Lab/commit/258cba2a8a663461c5f94014e41dd09291139d70)
- [Shell 脚本 目录文件摘要函数 日志错误统计 重要目录磁盘使用情况](https://github.com/ceilf6/Lab/commit/110ad351aa68f809cdc0dbc19f4cc16ead5a9cef)
- [Shell 添加最后修改时间到文件开头 通过系统目录树中 /tmp 存储临时文件实现添加开头 通过 ls -l 拿到最后修改时间](https://github.com/ceilf6/Lab/commit/88e2b975b61159d51b7b3ea1c66c3c968aa6be57)
- [Shell 通过 while do done 逐行读取文件; IFS划分 - 通过 set 分割一个个参数然后用 # 获取参数个数 或 read存储到数组中用 #arr[@]](https://github.com/ceilf6/Lab/commit/7e5b6c9f7fb119ac03943832a57c87500125697c)
