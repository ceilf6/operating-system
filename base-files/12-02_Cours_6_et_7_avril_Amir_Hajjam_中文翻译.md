# 第6与第7课（4月6日与7日）—— Amir Hajjam

> 由课件《12_Cours 6 et 7 avril - Amir Hajjam.pdf》翻译整理而成。

## 文件管理系统

### Unix 下的文件

在 Unix 中，一个文件：

- 总是由一个名称标识；
- 拥有唯一的 inode（保存与文件有关的部分信息）；
- 具有以下操作能力：
  - 打开；
  - 关闭；
  - 读取（查看）；
  - 写入（修改）。

一个文件可以是：

- 普通文件（有时也称为“普通/正常”文件）；
- 目录；
- 符号链接；
- 伪文件：
  - 按字符访问的设备；
  - 通信设备；
  - 按块访问的设备。

### 文件系统

文件系统（或文件管理系统）是一种**存储并组织信息为文件**的方式。

它是按照某种给定格式组织起来的一组目录和文件。系统能够以读写方式识别数十种文件系统格式。

根据文件系统的类型，用来持久化数据的介质可以是：

- 由本地磁盘控制器管理的设备分区（如磁盘、硬件 RAID 控制器）；
- 可移动设备（如软盘、CD-ROM）；
- 网络上提供的资源（如 NFS 或 SMB 服务器）；
- 内存（如 tmpfs 文件系统）；
- 虚拟空间（如 proc、sysfs、usbdevfs、devpts 等）；
- 模拟的块设备（如 ramdisk、loop、NBD、LVM、软件 RAID 提供的设备）。

### 最常用的文件系统与挂载

课件中提到，最常用的文件系统是 **ext3**。要创建一个新的文件系统并将其永久挂载到目录树中，需要：

1. 配置一个块设备；
2. 用 `mkfs` 命令创建文件系统；
3. 选择一个挂载点；
4. 用 `mount` 命令把文件系统挂载到挂载点；
5. 在 `/etc/fstab` 中添加一行，使系统每次启动时自动挂载。

第一步如何做取决于存储介质类型。多数情况下，它是本地磁盘上的一个分区，通常使用 `fdisk` 创建。

一个“合理安装”的操作系统通常会把磁盘划分为多个分区，例如：

- 系统分区（系统文件、配置文件等）；
- 用户分区（用户数据）；

这样做的优点：

- 更安全；
- 可以只格式化某一个分区，而不影响其他分区；
- 某些分区可以只读挂载。

## 创建文件系统

### 磁盘分区与格式化

硬盘处理通常分为：

- **低级格式化**（物理格式化，在工厂完成）；
- **分区**（通常在安装操作系统时进行）；
- **高级格式化**（逻辑格式化，与操作系统和目标文件系统有关）。

常见工具：

- DOS：`fips`、`fdisk`、`PartitionMagic`
- Linux：`fdisk`、`parted`
- 安装 Linux 时的文本/图形安装菜单

常见格式化命令：

- Windows：`format`（创建 FAT 或 NTFS 文件系统）
- Unix/Linux：`mkfs`（创建 Ext2、Ext3、FAT 等文件系统）

示例：

```bash
mkfs -t ext2 /dev/hda1
mkfs -t vfat /dev/fd0
```

日志型文件系统（journaled filesystem）对故障更稳健。

### 不同系统支持的文件系统（课件示意）

- DOS：FAT16
- Windows 95：FAT16
- Windows 95 OSR2：FAT16、FAT32
- Windows 98：FAT16、FAT32
- Windows NT4：FAT、NTFS v4
- Windows 2000/XP：FAT、FAT16、FAT32、NTFS v4/v5
- Linux：Ext2、Ext3、ReiserFS、Linux Swap，以及 FAT、NTFS 等
- MacOS：HFS、MFS
- SGI IRIX：XFS
- FreeBSD / OpenBSD：UFS
- Sun Solaris：UFS
- IBM AIX：JFS

### 创建分区与文件系统示例

创建分区 `hda9` 并建立文件系统：

```bash
fdisk /dev/hda
# 使用 p 显示分区表，n 创建分区，w 写入磁盘
# 某些情况下需要重启

mkfs -t ext3 /dev/hda9
mount -t ext3 /dev/hda9 /opt
echo /dev/hda9 /opt ext3 defaults 1 2 >> /etc/fstab
```

### 在“镜像文件”里创建文件系统

也可以在普通文件中创建文件系统镜像：

```bash
dd if=/dev/zero of=/var/local/myfs bs=1024 count=102400
mkfs -t ext3 /var/local/myfs
mkdir /mnt/tmp
mount -o loop -t ext3 /var/local/myfs /mnt/tmp
echo /dev/hda9 /opt ext3 loop 1 2 >> /etc/fstab
```

其中：

- `if`：输入文件
- `of`：输出文件
- `bs`：每次读/写的字节数
- `count`：复制的块数

## 修复文件系统

`fsck` 命令可用于检查文件系统完整性，并在可能时尝试修复。

注意：**文件系统在修复前不能处于挂载状态**。因此，这类操作常常在单用户模式（runlevel 1）下执行。

示例：

```bash
init 1
umount /usr
fsck -t ext3 -f /dev/hda7
mount /usr
init 5
```

还可以在系统下次启动时强制检查所有本地文件系统：

```bash
touch /forcefsck
init 6
```

对于 ext2/ext3，修复过程中发现的孤立数据块会被放到每个文件系统根目录下的 `lost+found` 目录中。

## 挂载网络文件系统

课件给出了一个挂载 Windows 共享目录的例子。假设：

- 域：`WG`
- 服务器：`serveur`
- 共享名：`archives`
- 用户：`utilisateur`
- 密码：`mot_de_passe`
- 挂载点：`/mnt/archives`

示例步骤：

```bash
mkdir /mnt/archives
touch /etc/passwd.smb
chmod 600 /etc/passwd.smb
vi /etc/passwd.smb
```

在文件中加入：

```text
username = utilisateur
password = mot_de_passe
```

然后执行：

```bash
mount -t smb -o workgroup=WG,credentials=/etc/passwd.smb //serveur/archives /mnt/archives
echo //serveur/archives /mnt/archives smb workgroup=WG,credentials=/etc/passwd.smb 0 0 >> /etc/fstab
```

### 可移动设备的注意事项

在拔出软盘、U 盘等可移动设备前，**必须先执行 `umount` 卸载**，以便把缓存中的写入同步到磁盘。

所有永久挂载项都记录在 `/etc/fstab` 中。

---

# 虚拟内存

## 虚拟内存的概念

虚拟内存技术允许执行**大小超过物理内存容量**的程序。

系统可通过两种方式管理虚拟内存：

- 分区；
- 文件。

其中，**交换文件通常比交换分区性能差**。一般更常见的是使用分区。

如果系统有两个或以上磁盘，在每个磁盘上都建立一个专用的交换分区，可能提升性能。

这些交换分区应具有系统标识符 `0x82`。在 Linux 的 `fdisk` 中，需要通过选项 `t` 来修改新分区的类型标识。

## 创建交换空间

要创建并永久启用新的交换空间，需要：

1. 创建一个分区或空文件；
2. 用 `mkswap` 创建交换签名；
3. 用 `swapon` 启用交换空间；
4. 在 `/etc/fstab` 中添加配置，以便开机自动启用。

### 添加 100MB 交换文件的示例

```bash
dd if=/dev/zero of=/swapfile bs=1024 count=102400
mkswap /swapfile
swapon /swapfile
echo /swapfile swap swap defaults 0 0 >> /etc/fstab
swapon -s
```

`swapon -s` 可显示已启用的交换空间信息，例如：

- `/dev/hda3`：partition
- `/swapfile`：file

---

# 归档（Archives）

## tar 命令

`tar`（Tape ARchiver）是 Unix 中用于管理文件和目录归档的命令。它最初用于磁带归档，现在则广泛用于创建可通过网络传输的归档文件，类似 zip。

### 创建归档

- `c`：创建归档
- `f`：指定输出目标（文件或设备）

示例：

```bash
cd /
tar cf /mnt/backups/backup-home.tar home
tar cf /dev/st0 home
```

注意：某些 `tar` 版本会把**绝对路径**保存进归档中，因此恢复时要格外小心。通常建议在父目录中使用**相对路径**进行归档。

## tar 与压缩

`tar` 本身**不压缩数据**，压缩需结合其他命令。

### 使用 compress

```bash
cd /
tar cf /mnt/backups/backup-home.tar home
compress /mnt/backups/backup-home.tar
```

`compress` 会把命令行给出的文件替换为压缩版本，并在文件名后加上 `.Z` 后缀。

### 使用管道

```bash
cd /
tar cf - home | compress > /mnt/backups/backup-home.tar.Z
```

其中 `-` 表示标准输出。

### GNU tar 的简化写法

```bash
cd /
tar cZf /mnt/backups/backup-home.tar.gz home
```

## compress、gzip、bzip2

课件概括了三种常见压缩工具：

| 压缩命令 | 解压命令 | 效率 | 速度 | 扩展名 | GNU tar 选项 |
|---|---|---:|---:|---|---|
| `compress` | `uncompress` | 中等 | 中等 | `.Z` | `Z` |
| `gzip` | `gunzip` | 较好 | 中等 | `.gz` | `z` |
| `bzip2` | `bunzip2` | 很好 | 较慢 | `.bz2` | `j` |

其中，`compress` 已较老，更多是出于兼容性原因才继续使用。

## 查看与解压归档

### 列出归档内容

- `t`：列出归档内容
- `v`：显示更详细信息

示例：

```bash
tar tvzf /mnt/backups/backup-home.tar.gz
```

### 解压归档

- `x`：解压

如果归档中使用的是相对路径，则默认恢复到当前目录；如果保存的是绝对路径，则可能恢复到原路径。

示例：

```bash
mkdir /home/tmp-restauration
cd /home/tmp-restauration
tar xzf /mnt/backups/backup-home.tar.gz
```

---

# 内核模块

## 模块的概念

模块是一段可为内核添加功能的代码，例如：

- 硬件设备驱动；
- 网络协议支持等。

某些内核功能可以单独编译成模块，从而在不重新编译内核的情况下动态加载。

### 优点

- 减小内核体积；
- 支持硬件的动态配置；
- 可在不重编内核的前提下扩展功能；
- 某些驱动可以二进制形式发布。

### 缺点

- 增加系统复杂度。

模块通常以二进制文件形式存在，安装在：

```text
/lib/modules/内核版本/
```

## 模块的加载与卸载

查看当前已加载模块：

```bash
lsmod
```

卸载模块：

```bash
rmmod module
```

加载模块：

```bash
insmod /path/module.o [symbol=value ...]
```

## modprobe 与依赖

一个模块可能依赖其他模块。为了自动处理依赖，通常使用 `modprobe` 而不是 `insmod`。

`modprobe` 的优点：

- 自动加载依赖模块；
- 不必写模块完整路径。

模块参数通常保存在：

- `/etc/modules.conf`
- 或（2.6 内核）`/etc/modprobe.conf`

例如网络接口别名配置：

```text
alias eth0 eepro100
```

这样，当执行：

```bash
ifconfig eth0 192.168.2.1
```

而内核尚未识别到该网卡时，系统会尝试通过别名自动加载真实模块 `eepro100`。

---

# 网络管理

## 网络接口基础

网络配置的基本单位是**接口**。系统通常有多个接口，命名取决于类型与驱动加载顺序。

常见接口类型：

- `lo`：回环接口（loopback）
- `ethn`：以太网接口
- `pppn`：PPP 接口

其中：

- `lo` 总是绑定地址 `127.0.0.1`
- 以太网接口若在安装系统时被检测到，通常也会自动配置

## 网卡驱动与模块

网络驱动常常以内核模块形式提供。它们的启用方式有两种：

1. 当 `ifconfig` 引用一个未知接口时，由内核自动加载（前提是 `modules.conf` 中有别名）；
2. 由启动脚本显式加载。

示例配置：

```text
alias eth0 3c59x
alias eth0 ne
options ne io=0x220 irq=11
alias eth1 e1000
options e1000 Speed=1000 RxDescriptors=128
```

## ifconfig 命令

`ifconfig` 用于激活和配置网络接口。

### 查看所有接口

```bash
ifconfig -a
```

课件示例输出展示了：

- `eth0`：以太网接口的信息（MAC、IP、广播地址、掩码、收发统计等）
- `lo`：回环接口的信息

如果网卡未被识别，可先手动加载模块：

```bash
modprobe <模块名>
```

内核可用的网络驱动一般在：

```text
/lib/modules/<kernel>/kernel/drivers/net/
```

### 启用与关闭接口

```bash
ifconfig eth0 up
ifconfig eth0 down
```

### 配置 IP

```bash
ifconfig eth1 192.168.200.1 netmask 255.255.255.0 broadcast 192.168.200.255
```

其中：

- `netmask` 和 `broadcast` 可省略；
- 若省略，系统会根据网络类别自动推导。

### 给同一物理接口配置多个 IP

可以通过接口别名实现，例如：

```bash
ifconfig eth0:0 192.168.201.10
```

## 网络配置相关标准文件

课件列出的 IP 层标准配置文件：

- `/etc/protocols`：IP 协议
- `/etc/services`：TCP / UDP 服务
- `/etc/rpc`：RPC 服务
- `/etc/hosts`：静态主机名
- `/etc/networks`：静态网络名

其中前三个通常很少修改，因为内容大多标准化；后两个在使用 DNS 的网络里也不常手动维护。

## ifup 与 ifdown

- `ifup`：启用或刷新网络接口配置
- `ifdown`：停用网络接口

示例：

```bash
ifup eth0
ifdown eth0
```

使用 `-a` 可配置 `/etc/network/interfaces` 中通过 `auto` 声明的所有接口。

---

# 静态路由

## 查看路由表

使用 `route` 或 `netstat -r`：

```bash
route
netstat -r
```

如果加 `-n`，则不做地址解析，直接显示数字 IP。

## 添加路由的三种情况

### 1. 添加到某台主机的路由

```bash
route add -host 10.20.30.1 gw 192.168.200.2
```

### 2. 添加到某个网络的路由

```bash
route add -net 10.20.30.0 netmask 255.255.0.0
```

### 3. 添加默认路由

```bash
route add default gw gw.reseau.fr dev eth0
```

### 删除路由

```bash
route del -net 10.20.30.0 netmask 255.255.0.0
```

路由目标可以是：

- 网关（`gw`）
- 接口（`dev`）

## 名称解析

名称解析由多个机制完成，对应配置文件包括：

- `/etc/host.conf`
- `/etc/nsswitch.conf`

DNS 解析的主要配置文件是：

```text
/etc/resolv.conf
```

示例：

```text
search luke.net
nameserver 192.168.200.1
nameserver 192.168.200.10
```

含义：

- `search`：搜索域后缀
- `nameserver`：DNS 服务器地址

静态主机名也可写在 `/etc/hosts` 中，例如：

```text
127.0.0.1 localhost.localdomain localhost
192.168.200.201 jack.luke.net jack
192.168.200.1 gw
```

---

# inetd 与 xinetd

`inetd` 是一个“超级服务器”（super-server），监听多个 TCP/UDP 端口。当某端口收到连接时，它再启动对应应用。

优点：

- 减少常驻后台进程数量；

缺点：

- 响应更慢。

因此，HTTP、SMTP、DNS 等高频服务通常在系统启动时直接作为守护进程运行，而不是交给 `inetd`。

相关配置文件：

- `inetd`：`/etc/inetd.conf`
- `xinetd`：`/etc/xinetd.conf` 与 `/etc/xinetd.d/`

如今它们的使用已经越来越少，因为很多早期服务被淘汰，或改由独立守护进程处理。

---

# 最小邮件中继配置

Unix 系统常通过电子邮件进行内部通信，例如 `cron` 任务结果常通过邮件发送给用户，因此至少要对 MTA（邮件传输代理）做最基本配置。

## Postfix

只需在 `/etc/postfix/main.cf` 中设置：

```text
relayhost = [smtp-gw.domaine.fr]
```

## Sendmail

有两种情况：

### 1. 通过 m4 管理配置（`/etc/mail/sendmail.mc`）

需要：

1. 定义 `SMART_HOST`：

```text
define(`SMART_HOST', `[smtp-gw.domaine.fr]')
```

2. 重新生成 `sendmail.cf`：

```bash
make -C /etc/mail
```

### 2. 直接使用 `/etc/mail/sendmail.cf`

找到以 `DS` 开头的那一行，改为：

```text
DS[smtp-gw.domaine.fr]
```

---

# 常用网络工具

## arp

`arp` 用于查看或修改某接口的 ARP 缓存表。ARP 表保存 **IP 地址与 MAC 地址** 的对应关系。

示例查看：

```bash
arp -va
```

可看到类似：

```text
? (192.168.1.2) at 00:40:33:2D:B5:DD [ether] on eth0
```

常见操作：

- 添加静态项：

```bash
arp -s 192.168.1.2 00:40:33:2D:B5:DD
```

- 删除项：

```bash
arp -d 192.168.1.2
```

## route（补充）

课件进一步说明：

- 静态路由：人工指定数据包路径；
- 动态路由：路由器通过算法和拓扑信息自动调整路由表。

通常：

- 局域网中常结合静态路由；
- 大型或广域网络更多依赖动态路由。

### 路由表示例说明

示例：

```text
Destination Gateway     Genmask         Flags Metric Ref Use Iface
192.168.1.0 *           255.255.255.0   U     0      0   2   eth0
127.0.0.0   *           255.0.0.0       U     0      0   2   lo
default     192.168.1.9 0.0.0.0         UG    0      0   10  eth0
```

字段含义：

- `Destination`：目标地址
- `Gateway`：网关地址
- `Genmask`：掩码
- `Flags`：状态标志（如 U、H、G、D、M）
- `Metric`：路由代价
- `Ref`：依赖该路由的数量
- `Use`：使用次数
- `Iface`：接口名

第三行的意思是：

- 对所有未知网络，默认走 `192.168.1.9` 这个默认网关。

### route 语法摘要

```bash
route add [net | host] addr [gw passerelle] [metric coût] [netmask masque] [dev interface]
```

课件示例：

```bash
route add 127.0.0.1 lo
route add -net 192.168.2.0 eth0
route add saturne.foo.org
route add default gw ariane
route add duschmoll netmask 255.255.255.192

route del -net 192.168.1.0
route del -net toutbet-net
```

## netstat

`netstat` 用于：

- 检查网络配置；
- 查看连接状态；
- 统计信息；
- 监控服务器。

常见参数：

- `-a`：显示所有连接信息
- `-i`：显示接口统计
- `-c`：周期性刷新
- `-n`：用数字显示地址与端口
- `-r`：显示路由表
- `-t`：TCP socket 信息
- `-u`：UDP socket 信息

### 连接状态示例

```text
Proto Recv-Q Send-Q Local Address          Foreign Address        State
Tcp   0      126    uranus.planete.n:telnet 192.168.1.2:1037     ESTABLISHED
Udp   0      0      uranus.plan:netbios-dgm *:*                 
Udp   0      0      uranus.plane:netbios-ns *:*                 
```

字段说明：

- `Proto`：协议
- `Recv-Q`：接收队列
- `Send-Q`：发送队列
- `Local Address`：本地主机与端口
- `Foreign Address`：远端主机与端口
- `State`：连接状态

常见状态：

- `ESTABLISHED`：已建立
- `SYN_SENT`：正在尝试建立连接
- `SYN_RECV`：收到连接请求
- `FIN_WAIT2`：连接关闭过程
- `CLOSED`：未使用
- `CLOSE_WAIT`：远端已关闭，本地等待关闭
- `LAST_ACK`：等待远端确认最终关闭
- `LISTEN`：监听中
- `UNKNOWN`：未知状态

### UNIX 域 socket

课件也给出了 UNIX 域 socket 的示例输出，字段包括：

- `Proto`
- `RefCnt`
- `Flags`
- `Type`
- `State`
- `I-Node`
- `Path`

其中 `Path` 表示进程用于访问该 socket 的路径。

### netstat 查看路由表

```bash
netstat -nr
netstat -r
```

示例输出中的主要字段：

- `Destination`
- `Gateway`
- `Genmask`
- `Flags`
- `Iface`

---

# 其他有用工具

在 Linux 网络配置调试中，还常会用到：

### 测试 IP 连通性

```bash
ping jo.luke.net
```

### 查看从本机到目标主机的路径

```bash
traceroute jo.luke.net
```

### DNS 解析测试

```bash
host lucky.luke.net
host -t mx luke.net
host 192.168.200.1
```
