# TD 3.1 与 TD 3.2（中文翻译）

## TD 3.1

## 练习 1

解释 `syslog.conf` 中的以下几行：

```conf
mail.notice /var/log/mail
*.emerg @mothership.mydomain.org
mail,uucp.notice /var/log/mail
mail,uucp.notice;uucp.!=alert /var/log/mail
mail,uucp.notice;uucp.!alert /var/log/mail
```

对应含义如下：

1. **`mail.notice /var/log/mail`**  
   来自 **mail facility**、优先级为 **notice 及以上** 的消息，会被发送到 `mail` 文件中。

2. **`*.emerg @mothership.mydomain.org`**  
   来自 **所有 facility**、优先级为 **emerg 及以上** 的消息，会被发送到主机 `mothership.mydomain.org`。

3. **`mail,uucp.notice /var/log/mail`**  
   来自 **mail** 和 **uucp** 这两个 facility、优先级为 **notice 及以上** 的消息，会被发送到 `mail` 文件中。

4. **`mail,uucp.notice;uucp.!=alert /var/log/mail`**  
   来自 **mail** 和 **uucp** 的、优先级为 **notice 及以上** 的消息会被发送到 `mail` 文件中，  
   但 **uucp 中优先级恰好为 alert 的消息除外**。

5. **`mail,uucp.notice;uucp.!alert /var/log/mail`**  
   来自 **mail** 和 **uucp** 的、优先级为 **notice 及以上** 的消息会被发送到 `mail` 文件中，  
   但 **uucp 中优先级为 alert 以及更高的消息除外**。

---

## 练习 2 —— 日志轮转

1. 配置 `/var/log/warnings.log` 的自动轮转，防止其变得过大（使用 `logrotate`）。
2. 将日志文件大小限制为 **10 MB**，并保留最近 **5** 个轮转后的文件。

### 配置方法

修改配置文件：

```bash
sudo nano /etc/logrotate.d/warnings
```

添加以下内容：

```conf
/var/log/warnings.log {
    size 10M
    rotate 5
    compress
    missingok
    notifempty
    create 640 root root
}
```

### 测试配置

```bash
sudo logrotate -d /etc/logrotate.conf
```

### 应用轮转

```bash
sudo logrotate /etc/logrotate.conf
```

---

## Syslog 与 Rsyslog 介绍

`syslog` 和 `rsyslog` 都是 Unix/Linux 下用于日志管理和处理的系统。  
它们共享一些基础功能，但在能力和使用场景上有所不同。

### Rsyslog

`rsyslog` 是 `syslog` 的增强版本，旨在弥补 `syslog` 的局限，并满足现代系统的需求。

- **向后兼容**  
  可以使用 `syslog` 的配置文件（`/etc/syslog.conf`），但通常使用 `/etc/rsyslog.conf`。

- **更先进的协议支持**
  - 支持现代 Syslog 协议，例如 **RFC 5424**（比 RFC 3164 更健壮）。
  - 支持 **UDP、TCP 和 TLS**，可实现更安全的通信。

- **更强的能力与可扩展性**
  - 可以处理大量日志。
  - 可以将日志写入数据库（如 MySQL、PostgreSQL），或者发送到集中式日志系统。

- **高级过滤**
  - 支持基于正则表达式或特定条件的复杂规则。

- **附加模块**
  - 可以通过模块添加更多功能（例如 `ommysql` 用于 MySQL）。

- **更高性能**
  - 针对高强度日志环境做了优化。

- **结构化日志**
  - 支持 JSON 等格式，适合现代系统集成。

- **集中式管理**
  - 在分布式环境中常用于集中采集日志。

### 什么时候使用 syslog 或 rsyslog？

- **Syslog**
  - 当系统比较简单、轻量，日志需求也比较基础时使用。

- **Rsyslog**
  - 当环境更复杂、日志量更大，或者需要与数据库和现代系统集成时使用。

> 在大多数现代场景中，更推荐使用 **rsyslog**，因为它更强大、更灵活，同时仍保持对 `syslog` 的兼容。

### 测试消息处理

假设消息在被拦截后会记录到 `/var/log/auth_warning.log` 中，可以使用下面的命令生成一条日志消息：

```bash
logger -p auth.warning "Test warning message"
```

然后检查该消息是否被成功处理并追加到文件中：

```bash
cat /var/log/auth_warning.log
```

---

## 练习 3 —— 针对关键事件的实时告警

配置一个实时告警机制：对于系统中所有 **关键事件**（`crit` 或以上级别），自动向管理员发送一封包含日志内容的电子邮件。

1. 配置 `rsyslog`，检测关键事件并执行一个自定义脚本来发送邮件。
2. 编写一个 Shell 脚本，用于生成包含相关信息的邮件。

### 提示

- 使用 `omprog` 模块，或在 `/etc/rsyslog.conf` 中通过指令配置命令。
- 确保系统具有发送邮件的能力（例如使用 `mailx` 或 `sendmail`）。

### `rsyslog` 中的 `omprog` 是什么？

`omprog` 是 `rsyslog` 的一个**输出模块**（output module），允许执行外部程序来处理或记录日志消息。  
它不是将消息写入文件、数据库或其他标准目标，而是把消息发送给第三方程序进行自定义处理。

例如，它允许写成：

```conf
mail.notice | /usr/local/bin/send_notice.sh
```

而不是简单写成：

```conf
mail.notice /var/log/mail
```

### 示例实现

在 `/etc/rsyslog.conf` 中添加：

```conf
*.crit |/usr/local/bin/send_alert.sh
```

创建脚本 `/usr/local/bin/send_alert.sh`：

```bash
#!/bin/bash
while read line; do
    echo "$line" | mailx -s "检测到关键告警" admin@example.com
done
```

赋予可执行权限：

```bash
chmod +x /usr/local/bin/send_alert.sh
```

重启 `rsyslog` 以应用配置：

```bash
sudo systemctl restart rsyslog
# 或
sudo service rsyslog restart
# 或
sudo killall rsyslogd
```

---

## TD 3.2

## 练习 4 —— 配置 rsyslog 将日志发送到远程服务器

配置一台 Unix 服务器，将所有日志消息发送到一个远程服务器，该服务器 IP 为 `192.168.1.100`，端口为 **UDP 514**。

在客户端的 `/etc/rsyslog.conf` 中加入以下一行，将日志发送到远程服务器：

```conf
*.* @192.168.1.100:514
```

如果希望使用 **TCP**（比 UDP 更可靠，因为 UDP 不保证消息送达），则使用 `@@` 替换 `@`：

```conf
*.* @@192.168.1.100:514
```

---

## 练习 5 —— 过滤 warning 级别的消息并交给 Bash 脚本处理

配置 `rsyslog`，检测所有来自 **auth facility** 且级别为 **warning（或更高）** 的消息，并将它们发送给一个 Bash 脚本。  
该脚本需要将这些消息写入 `/var/log/auth_warning.log`，并附带如下格式的时间戳：

```text
2024-12-30 14:35:42 Authentication failure for user 'admin'
```

### 示例脚本

创建脚本 `/usr/local/bin/process_auth_warnings.sh`：

```bash
#!/bin/bash
while read -r line; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') $line" >> /var/log/auth_warning.log
done
```

赋予可执行权限：

```bash
sudo chmod +x /usr/local/bin/auth_warnings.sh
```

修改 `/etc/rsyslog.conf`：

```conf
auth.warning |/usr/local/bin/auth_warnings.sh
```

或者：

```conf
if ($syslogfacility-text == 'auth' and $msg contains 'warning') then |/usr/local/bin/auth_warnings.sh
```

或者：

```conf
if ($syslogfacility-text == 'auth' and $syslogseverity <= 4) then {
    action(type="omprog" binary="/usr/local/bin/auth_warnings.sh")
    stop
}
```

---

## 练习 6 —— 为特定用户监控日志

创建一个脚本，用于监控某个特定用户的日志：

1. 检查指定用户是否存在于系统中。
2. 在日志（`/var/log/syslog`）中查找包含该用户名的事件。
3. 将结果保存到该用户主目录中的一个文本文件中。
4. 使用 `cron` 将该脚本设置为每天执行。

### 监控脚本

```bash
#!/bin/bash

# 请求输入用户名
echo "请输入要监控的用户名："
read -r USERNAME

# 检查用户是否存在
if ! id "$USERNAME" &>/dev/null; then
    echo "用户 $USERNAME 不存在。"
    exit 1
fi

# 用户主目录
USER_HOME=$(getent passwd "$USERNAME" | cut -d: -f6)

# getent passwd "$USERNAME" 会在用户数据库中查找对应条目
# 格式通常为：login:passwd:uid:gid:gecos:home_dir:shell

# 检查用户主目录是否存在
if [ ! -d "$USER_HOME" ]; then
    echo "找不到用户 $USERNAME 的主目录。"
    exit 1
fi

# 用于保存事件的文件
EVENTS_FILE="$USER_HOME/user_events.log"

# 搜索 /var/log/syslog 中包含该用户名的事件
echo "用户 $USERNAME 的事件（执行时间：$(date)）：" > "$EVENTS_FILE"
grep "$USERNAME" /var/log/syslog >> "$EVENTS_FILE"

echo "事件已保存到 $EVENTS_FILE"
```

### 定时执行计划

编辑 crontab：

```bash
crontab -e
```

添加：

```cron
0 0 * * * /home/utilisateur/scripts/monitor_user_simple.sh > /home/utilisateur/scripts/monitor_user_simple.log 2>&1
```
