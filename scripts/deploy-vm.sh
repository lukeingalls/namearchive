#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?PROJECT_ID is required}"
ZONE="${ZONE:?ZONE is required}"
INSTANCE_NAME="${INSTANCE_NAME:?INSTANCE_NAME is required}"
RELEASE_TAG="${RELEASE_TAG:-$(date -u +%Y%m%d-%H%M%S)}"
ARCHIVE_PATH="${ARCHIVE_PATH:-/workspace/namearchive-release.tgz}"
REMOTE_TMP="/tmp/namearchive-release-${RELEASE_TAG}.tgz"
REMOTE_RELEASE="/opt/namearchive/releases/${RELEASE_TAG}"

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "Archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

gcloud compute scp "${ARCHIVE_PATH}" "${INSTANCE_NAME}:${REMOTE_TMP}" \
  --project "${PROJECT_ID}" \
  --zone "${ZONE}"

gcloud compute ssh "${INSTANCE_NAME}" \
  --project "${PROJECT_ID}" \
  --zone "${ZONE}" \
  --command "sudo mkdir -p /opt/namearchive/releases /opt/namearchive/shared/db /opt/namearchive/shared/og-cache && \
    sudo mkdir -p '${REMOTE_RELEASE}' && \
    sudo tar -xzf '${REMOTE_TMP}' -C '${REMOTE_RELEASE}' && \
    sudo rm -rf '${REMOTE_RELEASE}/apps/server/.og-cache' && \
    sudo ln -sfn /opt/namearchive/shared/og-cache '${REMOTE_RELEASE}/apps/server/.og-cache' && \
    sudo ln -sfn '${REMOTE_RELEASE}' /opt/namearchive/current && \
    sudo chown -R namearchive:namearchive /opt/namearchive && \
    sudo systemctl restart namearchive && \
    rm -f '${REMOTE_TMP}'"

gcloud compute ssh "${INSTANCE_NAME}" \
  --project "${PROJECT_ID}" \
  --zone "${ZONE}" \
  --command "curl -fsS http://127.0.0.1:8080/api/home >/dev/null && curl -fsS http://127.0.0.1:8080/n/Emma >/dev/null"

echo "Deployment ${RELEASE_TAG} completed"
