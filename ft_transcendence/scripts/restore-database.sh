#!/usr/bin/env bash
# Restore MySQL from a gzipped mysqldump created by backup-database.sh.
# Usage:
#   make restore FILE=backups/mysql-full-YYYYMMDDTHHMMSSZ.sql.gz
#   ./scripts/restore-database.sh /backups/mysql-full-....sql.gz
set -euo pipefail

SQL_FILE="${1:-${FILE:-}}"
MYSQL_HOST="${MYSQL_HOST:-database}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_ROOT_PASSWORD:-${MYSQL_PASSWORD:-}}"
SSL_CA="${SSL_CA:-/certs/ca/ca.crt}"

if [[ -z "${SQL_FILE}" ]]; then
  echo "usage: $0 <path-to-mysql-full-....sql.gz>" >&2
  echo "   or: FILE=backups/mysql-full-....sql.gz $0" >&2
  exit 1
fi

if [[ ! -f "${SQL_FILE}" ]]; then
  echo "error: dump not found: ${SQL_FILE}" >&2
  exit 1
fi

if [[ -z "${MYSQL_PASSWORD}" ]]; then
  echo "error: MYSQL_ROOT_PASSWORD (or MYSQL_PASSWORD) must be set" >&2
  exit 1
fi

echo "[restore] WARNING: this overwrites databases from ${SQL_FILE}"
echo "[restore] target ${MYSQL_HOST}:${MYSQL_PORT}"
gunzip -c "${SQL_FILE}" | mysql \
  --host="${MYSQL_HOST}" \
  --port="${MYSQL_PORT}" \
  --user="${MYSQL_USER}" \
  --password="${MYSQL_PASSWORD}" \
  --ssl-mode=VERIFY_CA \
  --ssl-ca="${SSL_CA}"

echo "[restore] MySQL restore finished."
echo "[restore] Restart app services (user-service, event-service, api-gateway) if they were running."
echo "[restore] To restore uploads: tar -xzf backups/uploads-....tar.gz -C <parent-of-uploads-dir>"
