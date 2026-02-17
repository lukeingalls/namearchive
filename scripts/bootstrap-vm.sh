#!/usr/bin/env bash
set -euo pipefail

APP_USER="${APP_USER:-namearchive}"
APP_DIR="${APP_DIR:-/opt/namearchive}"
DOMAIN_NAME="${DOMAIN_NAME:-namearchive.org}"

sudo apt-get update
sudo apt-get install -y \
  git \
  curl \
  sqlite3 \
  gzip \
  fontconfig \
  fonts-dejavu-core \
  fonts-liberation2 \
  fonts-noto-core

if ! id "${APP_USER}" >/dev/null 2>&1; then
  sudo useradd --system --home "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

sudo mkdir -p \
  "${APP_DIR}/releases" \
  "${APP_DIR}/shared/db" \
  "${APP_DIR}/shared/og-cache"
sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  sudo ln -sf /root/.bun/bin/bun /usr/bin/bun
fi

if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y caddy
fi

sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
${DOMAIN_NAME} {
  encode gzip
  reverse_proxy 127.0.0.1:8080
}
EOF

sudo systemctl restart caddy
sudo systemctl enable caddy

echo "Bootstrap complete. Install service units and environment files next."
