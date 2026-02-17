# Monitoring and Crash-Recovery Runbook

## Uptime checks

Create Cloud Monitoring uptime checks:
- `https://namearchive.org/`
- `https://namearchive.org/api/home`

Alert if either endpoint fails for 5 minutes.

## Alert policies

Create alert policies for:
- VM CPU > 85% for 10 minutes
- VM memory > 85% for 10 minutes
- Disk usage > 80%
- Uptime check failure > 5 minutes

Notification channels:
- Email
- Slack/webhook

## Crash recovery behavior

`namearchive.service` uses:
- `Restart=always`
- `RestartSec=5`
- `StartLimitIntervalSec=0`

This means process crashes should auto-restart without manual action.

## Manual recovery steps

1. Check service status:

```bash
sudo systemctl status namearchive
```

2. Check logs:

```bash
sudo journalctl -u namearchive -n 200 --no-pager
```

3. Restart service:

```bash
sudo systemctl restart namearchive
```

4. Validate:

```bash
curl -fsS http://127.0.0.1:8080/api/home >/dev/null
curl -fsS http://127.0.0.1:8080/n/Emma >/dev/null
```

## Host reboot verification

After reboot:

```bash
sudo systemctl is-enabled namearchive
sudo systemctl status namearchive
```

Expected: service is enabled and running.

## Backup restore drill

1. Stop app:

```bash
sudo systemctl stop namearchive
```

2. Restore latest backup:

```bash
sudo gunzip -c /var/backups/namearchive/<file>.sqlite.gz > /opt/namearchive/shared/data/namearchive.sqlite
sudo chown namearchive:namearchive /opt/namearchive/shared/data/namearchive.sqlite
```

3. Start app:

```bash
sudo systemctl start namearchive
```

4. Validate endpoints again.
