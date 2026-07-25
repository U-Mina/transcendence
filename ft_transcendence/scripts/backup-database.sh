#!/usr/bin/env bash
# Automated MySQL backup over TLS (+ optional uploads archive).
# Intended to run inside the db-backup Compose service, or via: make backup
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
MYSQL_HOST="${MYSQL_HOST:-database}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_ROOT_PASSWORD:-${MYSQL_PASSWORD:-}}"
SSL_CA="${SSL_CA:-/certs/ca/ca.crt}"
UPLOADS_DIR="${UPLOADS_DIR:-/uploads}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SQL_FILE="${BACKUP_DIR}/mysql-full-${STAMP}.sql.gz"
UPLOADS_FILE="${BACKUP_DIR}/uploads-${STAMP}.tar.gz"

if [[ -z "${MYSQL_PASSWORD}" ]]; then
  echo "error: MYSQL_ROOT_PASSWORD (or MYSQL_PASSWORD) must be set" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo "[backup] dumping MySQL from ${MYSQL_HOST}:${MYSQL_PORT} → ${SQL_FILE}"

mysqldump \
  --host="${MYSQL_HOST}" \
  --port="${MYSQL_PORT}" \
  --user="${MYSQL_USER}" \
  --password="${MYSQL_PASSWORD}" \
  --ssl-mode=VERIFY_CA \
  --ssl-ca="${SSL_CA}" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --all-databases \
  --hex-blob \
  | gzip -c > "${SQL_FILE}"

echo "[backup] MySQL dump OK ($(du -h "${SQL_FILE}" | awk '{print $1}'))"

if [[ -d "${UPLOADS_DIR}" ]] && [[ -n "$(ls -A "${UPLOADS_DIR}" 2>/dev/null || true)" ]]; then
  echo "[backup] archiving uploads → ${UPLOADS_FILE}"
  tar -czf "${UPLOADS_FILE}" -C "$(dirname "${UPLOADS_DIR}")" "$(basename "${UPLOADS_DIR}")"
  echo "[backup] uploads archive OK ($(du -h "${UPLOADS_FILE}" | awk '{print $1}'))"
else
  echo "[backup] uploads skipped (empty or missing: ${UPLOADS_DIR})"
fi

# Prune old dumps (keep last RETENTION_DAYS)
if [[ "${RETENTION_DAYS}" =~ ^[0-9]+$ ]] && [[ "${RETENTION_DAYS}" -gt 0 ]]; then
  echo "[backup] pruning files older than ${RETENTION_DAYS} day(s) in ${BACKUP_DIR}"
  find "${BACKUP_DIR}" -type f \( -name 'mysql-full-*.sql.gz' -o -name 'uploads-*.tar.gz' \) \
    -mtime "+${RETENTION_DAYS}" -print -delete || true
fi

echo "[backup] done at ${STAMP}"
ls -lah "${BACKUP_DIR}" | tail -n +1
