# ln 默认创建的是硬链接
ln ./test-files/esN ./test-files/esN-hard-link

ln -s ./test-files/esN ./test-files/esN-soft-link

ls -l ./test-files
<<'COMMENT'
total 24
-r-xr-x-w-  2 a86198  staff   2 Apr 13 15:42 esN
-r-xr-x-w-  2 a86198  staff   2 Apr 13 15:42 esN-hard-link
lrwxr-xr-x  1 a86198  staff  16 Apr 13 16:25 esN-soft-link -> ./test-files/esN
-rw-r--r--  1 a86198  staff   4 Apr 13 15:42 esN2
drwxr-xr-x  2 a86198  staff  64 Apr 13 15:55 test-dir
COMMENT