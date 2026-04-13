# manual 打开某个命令或主题的帮助文档 / 使用手册
# 是离线的，因为查的是本地下载好的文档 /opt/homebrew/share/man
<<'COMMENT'
	•	NAME：这个命令是干什么的
	•	SYNOPSIS：基本语法怎么写
	•	DESCRIPTION：详细说明
	•	OPTIONS：有哪些参数
	•	EXAMPLES：有些手册会给例子
	•	SEE ALSO：相关命令
    •   Exit status：说明命令执行后的返回值，供Unix编程使用
COMMENT

man ls # 命令名
# wq 退出

# ls --help # 如果是 macOS 不是 GNU 那么不支持 --help

whatis ls

apropos ls