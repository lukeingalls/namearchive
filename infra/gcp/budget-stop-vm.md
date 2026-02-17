# Optional Budget Automation: Stop VM at 100% Budget

Use a Pub/Sub notification channel from Cloud Billing Budget and subscribe a small worker.

## Flow

1. Billing budget sends alert to topic `billing-alerts`.
2. Worker reads alert payload.
3. If threshold >= 1.0 (100%), run:

```bash
gcloud compute instances stop namearchive-prod --zone=us-west1-a
```

## Minimal worker contract

Inputs:

- `PROJECT_ID`
- `INSTANCE_NAME`
- `ZONE`

Behavior:

- Only stop instance when current cost/forecast crosses 100% threshold.
- Log action taken and source budget event.

## IAM for worker

- `roles/compute.instanceAdmin.v1` on project or scoped instance.

## Safety recommendation

- Start with "alert-only" mode for one billing cycle before enabling auto-stop.
