# CLI 工具，像 npm 拉下来的包的CLI工具就是在 node_modules/.bin/ 下面，npx 本质就是进入该目录进行执行
echo "=== 二进制文件"
ls -l /bin
<<'COMMENT'
total 9560
-rwxr-xr-x  1 root  wheel   101456 Feb 25 11:41 [
-r-xr-xr-x  1 root  wheel  1310208 Feb 25 11:41 bash
-rwxr-xr-x  1 root  wheel   118992 Feb 25 11:41 cat
-rwxr-xr-x  1 root  wheel   120656 Feb 25 11:41 chmod
-rwxr-xr-x  1 root  wheel   153360 Feb 25 11:41 cp
-rwxr-xr-x  2 root  wheel  1091936 Feb 25 11:41 csh
-rwxr-xr-x  1 root  wheel   274272 Feb 25 11:41 dash
-rwxr-xr-x  1 root  wheel   135392 Feb 25 11:41 date
-rwxr-xr-x  1 root  wheel   152576 Feb 25 11:41 dd
-rwxr-xr-x  1 root  wheel   119152 Feb 25 11:41 df
-rwxr-xr-x  1 root  wheel   101136 Feb 25 11:41 echo
-rwxr-xr-x  1 root  wheel   202528 Feb 25 11:41 ed
-rwxr-xr-x  1 root  wheel   102000 Feb 25 11:41 expr
-rwxr-xr-x  1 root  wheel   101184 Feb 25 11:41 hostname
-rwxr-xr-x  1 root  wheel   101504 Feb 25 11:41 kill
-r-xr-xr-x  1 root  wheel  2549488 Feb 25 11:41 ksh
-rwxr-xr-x  1 root  wheel   364448 Feb 25 11:41 launchctl
-rwxr-xr-x  2 root  wheel   102192 Feb 25 11:41 link
-rwxr-xr-x  2 root  wheel   102192 Feb 25 11:41 ln
-rwxr-xr-x  1 root  wheel   154624 Feb 25 11:41 ls
-rwxr-xr-x  1 root  wheel   101472 Feb 25 11:41 mkdir
-rwxr-xr-x  1 root  wheel   119440 Feb 25 11:41 mv
-rwxr-xr-x  1 root  wheel   304672 Feb 25 11:41 pax
-rwsr-xr-x  1 root  wheel   170816 Feb 25 11:41 ps
-rwxr-xr-x  1 root  wheel   101296 Feb 25 11:41 pwd
-rwxr-xr-x  1 root  wheel   101072 Feb 25 11:41 realpath
-rwxr-xr-x  2 root  wheel   119200 Feb 25 11:41 rm
-rwxr-xr-x  1 root  wheel   101120 Feb 25 11:41 rmdir
-rwxr-xr-x  1 root  wheel   101232 Feb 25 11:41 sh
-rwxr-xr-x  1 root  wheel   101168 Feb 25 11:41 sleep
-rwxr-xr-x  1 root  wheel   135504 Feb 25 11:41 stty
-rwxr-xr-x  1 root  wheel   100784 Feb 25 11:41 sync
-rwxr-xr-x  2 root  wheel  1091936 Feb 25 11:41 tcsh
-rwxr-xr-x  1 root  wheel   101472 Feb 25 11:41 test
-rwxr-xr-x  2 root  wheel   119200 Feb 25 11:41 unlink
-rwxr-xr-x  1 root  wheel   101056 Feb 25 11:41 wait4path
-rwxr-xr-x  1 root  wheel  1361200 Feb 25 11:41 zsh
COMMENT

echo "
=== 设备文件" # ""就能自动换行，不像 JS 会空白折叠，如果用 ``反而会导致命令替换
ls /dev