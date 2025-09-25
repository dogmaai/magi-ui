#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=$(gcloud config get-value project)
REGION=asia-northeast1
SERVICE=magi-app

echo "== MAGI verify =="

# サービス情報
SERVICE_URL=$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')
echo "URL: $SERVICE_URL"

# IDトークンを発行
ID_TOKEN=$(gcloud auth print-identity-token --audiences="$SERVICE_URL")

# /healthz チェック
echo -n "/healthz: "
curl -sS -H "Authorization: Bearer $ID_TOKEN" "$SERVICE_URL/healthz" || echo "NG"

# /status チェック
echo "/status:"
curl -sS -H "Authorization: Bearer $ID_TOKEN" "$SERVICE_URL/status" || echo "NG"
