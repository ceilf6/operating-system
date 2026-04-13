# 工具
brew install fzf zsh-autosuggestions zsh-syntax-highlighting

brew install thefuck
brew install autojump

# 追加入 ~/ .zshrc
cat >> ~/.zshrc <<'EOF'
# 启用 zsh 补全系统
autoload -Uz compinit
compinit

# 补全体验增强
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"

# 让补全更灵敏
setopt AUTO_MENU
setopt COMPLETE_IN_WORD
setopt ALWAYS_TO_END

# 历史命令搜索更好用
setopt HIST_IGNORE_DUPS
setopt SHARE_HISTORY

# 插件
source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# fzf
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
EOF

# 应用
$(brew --prefix)/opt/fzf/install
source ~/.zshrc