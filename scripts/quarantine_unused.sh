#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/quarantine_unused.sh [file1 file2 ...]
# Moves files to .trash/YYYYmmdd_HHMMSS/ preserving paths

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <file...>" >&2
  exit 1
fi

TS=$(date +%Y%m%d_%H%M%S)
TRASH_DIR=".trash/$TS"

for f in "$@"; do
  if [ ! -e "$f" ]; then
    echo "Skip (not found): $f" >&2
    continue
  fi
  dest_dir="$TRASH_DIR/$(dirname "$f")"
  mkdir -p "$dest_dir"
  git mv -f "$f" "$dest_dir/" 2>/dev/null || mv -f "$f" "$dest_dir/"
  echo "Quarantined: $f -> $dest_dir/"

done

echo "Done. Review and delete later: $TRASH_DIR"
