# source 修改命令提示符.sh
# . ./修改命令提示符.sh
# 默认是当前交互环境生效，如果想持久化得将这个命令添加入 ~/.zshrc 中
PS1='ceilf6 '

# 测试当前提示符
echo $PROMPT
print -P "$PROMPT"

PROMPT='ceilf7 '
# macOS 的 zsh 环境更推荐用 PROMPT