#!/usr/bin/env bash
set -euo pipefail

DB_PATH="${DB_PATH:-/opt/namearchive/shared/data/namearchive.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/namearchive}"
BUCKET_NAME="${BUCKET_NAME:-}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
SQLITE3_BIN="${SQLITE3_BIN:-sqlite3}"
GSUTIL_BIN="${GSUTIL_BIN:-gsutil}"

timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup_file="${BACKUP_DIR}/namearchive-${timestamp}.sqlite"
compressed_file="${backup_file}.gz"

mkdir -p "${BACKUP_DIR}"

if [[ ! -f "${DB_PATH}" ]]; then
  echo "Database not found at ${DB_PATH}" >&2
  exit 1
fi

${SQLITE3_BIN} "${DB_PATH}" "PRAGMA wal_checkpoint(TRUNCATE);"
${SQLITE3_BIN} "${DB_PATH}" ".backup '${backup_file}'"
gzip -f "${backup_file}"

if [[ -n "${BUCKET_NAME}" ]]; then
  ${GSUTIL_BIN} cp "${compressed_file}" "gs://${BUCKET_NAME}/sqlite/"
fi

find "${BACKUP_DIR}" -name "namearchive-*.sqlite.gz" -mtime +"${RETENTION_DAYS}" -delete
echo "Backup created: ${compressed_file}"
