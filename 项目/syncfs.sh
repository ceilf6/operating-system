#!/usr/bin/env bash
set -euo pipefail

# File system synchronizer for two directory trees.
# Implements the project algorithm with content comparison for ordinary files.
# Assumptions:
# - Paths do not contain tabs or newlines in the journal file.
# - Synchronization happens on one machine.
# - Journal tracks regular files only, as requested by the project statement.

usage() {
  cat <<'USAGE'
Usage: syncfs.sh [options] DIR_A DIR_B

Options:
  -l, --log FILE         Journal file (default: $HOME/.synchro.tsv)
  -n, --dry-run          Show actions without modifying files
  -i, --interactive      Ask how to resolve content conflicts
  -d, --diff            Show diff -u for text-file conflicts when possible
  -h, --help            Show this help

Journal format:
  Header lines:
    #SYNCFSv1
    A<TAB>absolute_path_to_A
    B<TAB>absolute_path_to_B
  Record lines:
    path<TAB>type<TAB>mode<TAB>size<TAB>mtime
USAGE
}

LOG_FILE="${HOME}/.synchro.tsv"
DRY_RUN=0
INTERACTIVE=0
SHOW_DIFF=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -l|--log)
      LOG_FILE="$2"; shift 2 ;;
    -n|--dry-run)
      DRY_RUN=1; shift ;;
    -i|--interactive)
      INTERACTIVE=1; shift ;;
    -d|--diff)
      SHOW_DIFF=1; shift ;;
    -h|--help)
      usage; exit 0 ;;
    --)
      shift; break ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2 ;;
    *)
      break ;;
  esac
done

if [[ $# -ne 2 ]]; then
  usage >&2
  exit 2
fi

DIR_A=$(realpath "$1")
DIR_B=$(realpath "$2")

if [[ ! -d "$DIR_A" || ! -d "$DIR_B" ]]; then
  echo "Both arguments must be existing directories." >&2
  exit 2
fi

if [[ "$DIR_A" == "$DIR_B" ]]; then
  echo "DIR_A and DIR_B must be different directories." >&2
  exit 2
fi

TMPDIR_SYNC=$(mktemp -d)
trap 'rm -rf "$TMPDIR_SYNC"' EXIT
NEW_LOG="$TMPDIR_SYNC/new_log.tsv"
CONFLICTS_FILE="$TMPDIR_SYNC/conflicts.txt"
META_CONFLICTS_FILE="$TMPDIR_SYNC/meta_conflicts.txt"
: > "$CONFLICTS_FILE"
: > "$META_CONFLICTS_FILE"

declare -A JOURNAL_TYPE JOURNAL_MODE JOURNAL_SIZE JOURNAL_MTIME

say() { printf '%s\n' "$*"; }
act() { if (( DRY_RUN )); then printf '[dry-run] %s\n' "$*"; else printf '%s\n' "$*"; fi; }

stat_type() {
  local p="$1"
  if [[ -d "$p" ]]; then printf 'dir';
  elif [[ -f "$p" ]]; then printf 'file';
  elif [[ -e "$p" ]]; then printf 'other';
  else printf 'missing'; fi
}

stat_mode() {
  stat -c '%a' -- "$1"
}

stat_size() {
  if [[ -f "$1" ]]; then stat -c '%s' -- "$1"; else printf '0'; fi
}

stat_mtime() {
  stat -c '%Y' -- "$1"
}

same_meta() {
  local a="$1" b="$2"
  [[ "$(stat_type "$a")" == "$(stat_type "$b")" ]] || return 1
  [[ "$(stat_mode "$a")" == "$(stat_mode "$b")" ]] || return 1
  [[ "$(stat_size "$a")" == "$(stat_size "$b")" ]] || return 1
  [[ "$(stat_mtime "$a")" == "$(stat_mtime "$b")" ]] || return 1
}

same_content() {
  cmp -s -- "$1" "$2"
}

journal_matches() {
  local rel="$1" path="$2"
  [[ -n "${JOURNAL_TYPE[$rel]:-}" ]] || return 1
  [[ "$(stat_type "$path")" == "${JOURNAL_TYPE[$rel]}" ]] || return 1
  [[ "$(stat_mode "$path")" == "${JOURNAL_MODE[$rel]}" ]] || return 1
  [[ "$(stat_size "$path")" == "${JOURNAL_SIZE[$rel]}" ]] || return 1
  [[ "$(stat_mtime "$path")" == "${JOURNAL_MTIME[$rel]}" ]] || return 1
}

ensure_parent() {
  local target="$1"
  local parent
  parent=$(dirname -- "$target")
  if [[ ! -d "$parent" ]]; then
    act "mkdir -p '$parent'"
    (( DRY_RUN )) || mkdir -p -- "$parent"
  fi
}

copy_item() {
  local src="$1" dst="$2"
  ensure_parent "$dst"
  local stype dtype
  stype=$(stat_type "$src")
  dtype=$(stat_type "$dst")

  if [[ "$stype" == "dir" ]]; then
    if [[ "$dtype" == "file" || "$dtype" == "other" ]]; then
      act "rm -rf '$dst'"
      (( DRY_RUN )) || rm -rf -- "$dst"
      dtype='missing'
    fi
    if [[ "$dtype" == "missing" ]]; then
      act "mkdir -p '$dst'"
      (( DRY_RUN )) || mkdir -p -- "$dst"
    fi
    local mode mtime
    mode=$(stat_mode "$src")
    mtime=$(stat_mtime "$src")
    act "chmod $mode '$dst' && touch -d '@$mtime' '$dst'"
    if (( ! DRY_RUN )); then
      chmod "$mode" -- "$dst"
      touch -d "@$mtime" -- "$dst"
    fi
  elif [[ "$stype" == "file" ]]; then
    if [[ "$dtype" == "dir" || "$dtype" == "other" ]]; then
      act "rm -rf '$dst'"
      (( DRY_RUN )) || rm -rf -- "$dst"
    fi
    act "cp -p '$src' '$dst'"
    (( DRY_RUN )) || cp -p -- "$src" "$dst"
  else
    say "Skipping unsupported type: $src" >&2
  fi
}

apply_metadata() {
  local src="$1" dst="$2"
  local mode mtime
  mode=$(stat_mode "$src")
  mtime=$(stat_mtime "$src")
  act "chmod $mode '$dst' && touch -d '@$mtime' '$dst'"
  if (( ! DRY_RUN )); then
    chmod "$mode" -- "$dst"
    touch -d "@$mtime" -- "$dst"
  fi
}

record_success() {
  local rel="$1" path="$2"
  [[ "$(stat_type "$path")" == "file" ]] || return 0
  printf '%s\t%s\t%s\t%s\t%s\n' \
    "$rel" "file" "$(stat_mode "$path")" "$(stat_size "$path")" "$(stat_mtime "$path")" >> "$NEW_LOG"
}

load_journal() {
  [[ -f "$LOG_FILE" ]] || return 0
  local magic a_tag a_path b_tag b_path
  IFS= read -r magic < "$LOG_FILE" || return 0
  if [[ "$magic" != "#SYNCFSv1" ]]; then
    say "Warning: unsupported journal format, ignoring: $LOG_FILE" >&2
    return 0
  fi
  {
    IFS=$'\t' read -r a_tag a_path || true
    IFS=$'\t' read -r b_tag b_path || true
    while IFS=$'\t' read -r rel type mode size mtime; do
      [[ -n "$rel" ]] || continue
      JOURNAL_TYPE["$rel"]="$type"
      JOURNAL_MODE["$rel"]="$mode"
      JOURNAL_SIZE["$rel"]="$size"
      JOURNAL_MTIME["$rel"]="$mtime"
    done
  } < <(tail -n +2 "$LOG_FILE")
}

build_union_paths() {
  local list="$TMPDIR_SYNC/paths.txt"
  {
    (cd "$DIR_A" && find . -mindepth 1 -printf '%P\n')
    (cd "$DIR_B" && find . -mindepth 1 -printf '%P\n')
  } | LC_ALL=C sort -u > "$list"
  printf '%s' "$list"
}

is_text_file() {
  local p="$1"
  file --brief --mime -- "$p" | grep -qi '^text/'
}

show_diff_if_possible() {
  local a="$1" b="$2" rel="$3"
  if (( SHOW_DIFF )) && is_text_file "$a" && is_text_file "$b"; then
    say "----- diff for $rel -----"
    diff -u -- "$a" "$b" || true
    say "----- end diff for $rel -----"
  fi
}

resolve_conflict_interactively() {
  local rel="$1" a="$2" b="$3"
  (( INTERACTIVE )) || return 1
  show_diff_if_possible "$a" "$b" "$rel"
  while true; do
    printf "Conflict for %s: choose [a] keep A, [b] keep B, [s] skip: " "$rel" >&2
    read -r answer || return 1
    case "$answer" in
      a|A)
        copy_item "$a" "$b"
        record_success "$rel" "$a"
        return 0 ;;
      b|B)
        copy_item "$b" "$a"
        record_success "$rel" "$b"
        return 0 ;;
      s|S)
        return 1 ;;
    esac
  done
}

handle_missing_side() {
  local rel="$1" a="$2" b="$3"
  local ta tb
  ta=$(stat_type "$a")
  tb=$(stat_type "$b")

  if [[ "$ta" == "missing" && "$tb" == "missing" ]]; then
    return 0
  fi

  # One side absent: copy from present side when safe or during initial sync.
  if [[ "$ta" == "missing" ]]; then
    if journal_matches "$rel" "$b" || [[ -z "${JOURNAL_TYPE[$rel]:-}" ]]; then
      act "create A/$rel from B/$rel"
      copy_item "$b" "$a"
      record_success "$rel" "$a"
    else
      printf '%s\tmissing-in-A\n' "$rel" >> "$CONFLICTS_FILE"
    fi
    return 0
  fi

  if [[ "$tb" == "missing" ]]; then
    if journal_matches "$rel" "$a" || [[ -z "${JOURNAL_TYPE[$rel]:-}" ]]; then
      act "create B/$rel from A/$rel"
      copy_item "$a" "$b"
      record_success "$rel" "$a"
    else
      printf '%s\tmissing-in-B\n' "$rel" >> "$CONFLICTS_FILE"
    fi
  fi
}

sync_path() {
  local rel="$1"
  local a="$DIR_A/$rel"
  local b="$DIR_B/$rel"
  local ta tb
  ta=$(stat_type "$a")
  tb=$(stat_type "$b")

  if [[ "$ta" == "missing" || "$tb" == "missing" ]]; then
    handle_missing_side "$rel" "$a" "$b"
    return
  fi

  if [[ "$ta" == "other" || "$tb" == "other" ]]; then
    printf '%s\tunsupported-type\n' "$rel" >> "$CONFLICTS_FILE"
    return
  fi

  if [[ "$ta" != "$tb" ]]; then
    printf '%s\ttype-conflict\n' "$rel" >> "$CONFLICTS_FILE"
    return
  fi

  if [[ "$ta" == "dir" ]]; then
    # Directories are handled by recursion via union list. Keep metadata aligned when one matches journal.
    if same_meta "$a" "$b"; then
      return
    elif journal_matches "$rel" "$a" && ! journal_matches "$rel" "$b"; then
      apply_metadata "$b" "$a"
    elif journal_matches "$rel" "$b" && ! journal_matches "$rel" "$a"; then
      apply_metadata "$a" "$b"
    fi
    return
  fi

  if same_meta "$a" "$b"; then
    record_success "$rel" "$a"
    return
  fi

  local a_ok=0 b_ok=0
  journal_matches "$rel" "$a" && a_ok=1
  journal_matches "$rel" "$b" && b_ok=1

  if (( a_ok == 1 && b_ok == 0 )); then
    act "copy B -> A for $rel"
    copy_item "$b" "$a"
    record_success "$rel" "$a"
    return
  fi

  if (( b_ok == 1 && a_ok == 0 )); then
    act "copy A -> B for $rel"
    copy_item "$a" "$b"
    record_success "$rel" "$a"
    return
  fi

  # Advanced mode: same content but metadata-only differences should not be reported as full conflict.
  if same_content "$a" "$b"; then
    if same_meta "$a" "$b"; then
      record_success "$rel" "$a"
      return
    elif (( a_ok == 1 && b_ok == 0 )); then
      act "metadata B -> A for $rel"
      apply_metadata "$b" "$a"
      record_success "$rel" "$a"
      return
    elif (( b_ok == 1 && a_ok == 0 )); then
      act "metadata A -> B for $rel"
      apply_metadata "$a" "$b"
      record_success "$rel" "$a"
      return
    else
      printf '%s\tmetadata-only-conflict\n' "$rel" >> "$META_CONFLICTS_FILE"
      return
    fi
  fi

  if ! resolve_conflict_interactively "$rel" "$a" "$b"; then
    printf '%s\tcontent-conflict\n' "$rel" >> "$CONFLICTS_FILE"
  fi
}

write_journal() {
  (( DRY_RUN )) && return 0
  {
    printf '#SYNCFSv1\n'
    printf 'A\t%s\n' "$DIR_A"
    printf 'B\t%s\n' "$DIR_B"
    LC_ALL=C sort "$NEW_LOG"
  } > "$LOG_FILE"
}

main() {
  load_journal
  local list rel
  list=$(build_union_paths)
  while IFS= read -r rel; do
    [[ -n "$rel" ]] || continue
    sync_path "$rel"
  done < "$list"
  write_journal

  say ""
  say "Synchronization finished."
  if [[ -s "$META_CONFLICTS_FILE" ]]; then
    say "Metadata-only conflicts:"
    sed 's/^/  - /' "$META_CONFLICTS_FILE"
  fi
  if [[ -s "$CONFLICTS_FILE" ]]; then
    say "Conflicts:"
    sed 's/^/  - /' "$CONFLICTS_FILE"
    exit 1
  else
    say "No blocking conflicts."
  fi
}

main "$@"
