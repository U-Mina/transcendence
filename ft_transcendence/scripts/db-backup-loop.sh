#!/usr/bin/env bash
# Runs backup-database.sh on a fixed interval (Compose db-backup service).
set -euo pipefail

INTERVAL="${BACKUP_INTERVAL_SECONDS:-86400}"

echo "[db-backup] starting; interval=${INTERVAL}s retention=${BACKUP_RETENTION_DAYS:-7}d"

# Run once at startup so eval/demo always has a fresh dump without waiting a day.
/backup-database.sh || echo "[db-backup] initial backup failed (will retry on next interval)" >&2

while true; do
  echo "[db-backup] sleeping ${INTERVAL}s…"
  sleep "${INTERVAL}"
  /backup-database.sh || echo "[db-backup] backup failed; will retry next interval" >&2
done
