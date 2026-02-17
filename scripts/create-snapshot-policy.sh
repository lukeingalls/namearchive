#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?PROJECT_ID is required}"
REGION="${REGION:-us-west1}"
ZONE="${ZONE:-us-west1-a}"
POLICY_NAME="${POLICY_NAME:-namearchive-disk-policy}"
DISK_NAME="${DISK_NAME:?DISK_NAME is required}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
START_TIME="${START_TIME:-00:00}"
HOURS_IN_CYCLE="${HOURS_IN_CYCLE:-6}"

gcloud compute resource-policies create snapshot-schedule "${POLICY_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --max-retention-days "${RETENTION_DAYS}" \
  --on-source-disk-delete keep-auto-snapshots \
  --start-time "${START_TIME}" \
  --hourly-schedule "${HOURS_IN_CYCLE}"

gcloud compute disks add-resource-policies "${DISK_NAME}" \
  --project "${PROJECT_ID}" \
  --zone "${ZONE}" \
  --resource-policies "${POLICY_NAME}"

echo "Snapshot policy ${POLICY_NAME} attached to disk ${DISK_NAME}"
