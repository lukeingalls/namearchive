# Google Cloud Production Setup (Compute Engine + SQLite)

This project is designed to run on a single Compute Engine VM with SQLite.

## 1) Required APIs

Enable:
- Compute Engine API
- Cloud Build API
- Cloud Monitoring API
- Cloud Logging API
- Cloud Billing Budget API
- Generative Language API

Example:

```bash
gcloud services enable \
  compute.googleapis.com \
  cloudbuild.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  billingbudgets.googleapis.com \
  generativelanguage.googleapis.com
```

## 2) VM Provisioning

Recommended VM:
- machine type: `e2-small`
- region: `us-central1`
- zone: `us-central1-a`
- boot disk: 20-30 GB SSD
- static external IP attached

Create a service account for the VM with minimal roles:
- `roles/logging.logWriter`
- `roles/monitoring.metricWriter`
- `roles/storage.objectAdmin` (if uploading backups to GCS)

## 3) Bootstrap and Service Setup

SSH into VM and run:

```bash
sudo bash /opt/namearchive/scripts/bootstrap-vm.sh
```

Install service units:

```bash
sudo cp /opt/namearchive/infra/systemd/namearchive.service /etc/systemd/system/
sudo cp /opt/namearchive/infra/systemd/namearchive-backup.service /etc/systemd/system/
sudo cp /opt/namearchive/infra/systemd/namearchive-backup.timer /etc/systemd/system/
```

Create app env:

```bash
sudo tee /etc/namearchive.env >/dev/null <<'EOF'
NODE_ENV=production
PORT=8080
GEMINI_API_KEY=REPLACE_ME
GEMINI_TIMEOUT_MS=12000
GEMINI_MAX_RETRIES=1
NAME_API_RATE_LIMIT_WINDOW_MS=60000
NAME_API_RATE_LIMIT_MAX=30
EOF
sudo chmod 600 /etc/namearchive.env
```

Create backup env:

```bash
sudo tee /etc/namearchive-backup.env >/dev/null <<'EOF'
DB_PATH=/opt/namearchive/shared/data/namearchive.sqlite
BACKUP_DIR=/var/backups/namearchive
BUCKET_NAME=namearchive-sqlite-backups
RETENTION_DAYS=30
SQLITE3_BIN=/usr/bin/sqlite3
GSUTIL_BIN=/usr/bin/gsutil
EOF
sudo chmod 600 /etc/namearchive-backup.env
```

Enable services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now namearchive
sudo systemctl enable --now namearchive-backup.timer
```

## 4) CI/CD Deploy

`cloudbuild.yaml` is included at repo root. Create a trigger on `main` branch.

Required Cloud Build service account permissions:
- `roles/compute.osAdminLogin` (or ssh/scp equivalent)
- `roles/compute.instanceAdmin.v1` (for deploy checks/restarts through SSH path)
- `roles/iam.serviceAccountUser` (if needed by your org policy)

Trigger uses:
- build with Bun
- package source/build artifacts
- run `scripts/deploy-vm.sh`
- smoke test `/api/home` and `/n/Emma`

## 5) Spend Controls

### Billing budget + alerts

Create budget in Billing Console:
- target amount (example: `$100/month`)
- threshold rules: `50%`, `75%`, `90%`, `100%`
- notifications: email + Pub/Sub topic (`billing-alerts`)

Optional hard-stop automation:
- subscriber service stops VM when 100% threshold event arrives:

```bash
gcloud compute instances stop namearchive-prod --zone=us-central1-a
```

See `infra/gcp/budget-stop-vm.md` for the worker contract.

### Gemini controls

For API key:
- Restrict to Generative Language API
- Restrict key usage by server IP if possible

Set quotas in API console:
- requests/minute
- requests/day
- token quotas (if shown for model)

## 6) Snapshot Policy (disk-level backups)

Create scheduled snapshot policy (every 6h, retain 14 days):

```bash
gcloud compute resource-policies create snapshot-schedule namearchive-disk-policy \
  --region=us-central1 \
  --max-retention-days=14 \
  --on-source-disk-delete=keep-auto-snapshots \
  --start-time=00:00 \
  --hourly-schedule=6
```

Attach policy to VM boot disk:

```bash
gcloud compute disks add-resource-policies namearchive-prod \
  --zone=us-central1-a \
  --resource-policies=namearchive-disk-policy
```
