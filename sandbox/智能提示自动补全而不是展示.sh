python3 - <<'PY'
from pathlib import Path
p = Path.home() / ".zshrc"
text = p.read_text() if p.exists() else ""

lines = text.splitlines()
filtered = []
skip = False

for line in lines:
    s = line.strip()

    # 去掉旧的简单绑定
    if s in {
        "bindkey '^I' autosuggest-accept",
        'bindkey "^I" autosuggest-accept',
        "# Tab 优先接受 zsh-autosuggestions 的灰色建议",
    }:
        continue

    # 去掉旧的自定义 widget（如果之前加过）
    if s.startswith("_tab_accept_or_complete() {"):
        skip = True
        continue
    if skip:
        if s == "}":
            skip = False
        continue

    # 去掉旧的 widget 注册
    if s in {
        "zle -N _tab_accept_or_complete",
        "bindkey '^I' _tab_accept_or_complete",
        'bindkey "^I" _tab_accept_or_complete',
        "# Tab: 有灰色建议时接受建议；否则走正常补全",
    }:
        continue

    filtered.append(line)

append = r'''
# Tab: 有灰色建议时接受建议；否则走正常补全
_tab_accept_or_complete() {
  if [[ -n "$POSTDISPLAY" ]]; then
    zle autosuggest-accept
  else
    zle expand-or-complete
  fi
}
zle -N _tab_accept_or_complete
bindkey '^I' _tab_accept_or_complete
'''.strip()

new_text = "\n".join(filtered).rstrip() + "\n\n" + append + "\n"
p.write_text(new_text)
print("Updated ~/.zshrc")
PY

source ~/.zshrc