#!/usr/bin/env bash
# Aggiorna .env.production con le variabili SMTP (senza committare password).
# Uso sul server:
#   SMTP_PASS='tua-password' ./deploy/ensure-email-env.sh
# oppure:
#   ./deploy.sh configure-email

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env.production"

: "${SMTP_PASS:?Imposta SMTP_PASS (password casella Libero)}"

OWNER_EMAIL="${OWNER_EMAIL:-fierauto2026@libero.it}"
SMTP_HOST="${SMTP_HOST:-smtp.libero.it}"
SMTP_PORT="${SMTP_PORT:-465}"
SMTP_USER="${SMTP_USER:-fierauto2026@libero.it}"

if [[ ! -f "$ENV_FILE" ]]; then
  cp .env.production.example "$ENV_FILE"
  echo "Creato $ENV_FILE da template"
fi

upsert_env() {
  local key="$1"
  local value="$2"
  local tmp
  tmp="$(mktemp)"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    awk -v k="$key" -v v="$value" '
      BEGIN { done = 0 }
      $0 ~ "^" k "=" { print k "=" v; done = 1; next }
      { print }
      END { if (!done) print k "=" v }
    ' "$ENV_FILE" >"$tmp"
  else
    cat "$ENV_FILE" >"$tmp"
    printf '\n%s=%s\n' "$key" "$value" >>"$tmp"
  fi
  mv "$tmp" "$ENV_FILE"
}

upsert_env "OWNER_EMAIL" "$OWNER_EMAIL"
upsert_env "SMTP_HOST" "$SMTP_HOST"
upsert_env "SMTP_PORT" "$SMTP_PORT"
upsert_env "SMTP_USER" "$SMTP_USER"
upsert_env "SMTP_PASS" "$SMTP_PASS"

echo "SMTP configurato in $ENV_FILE (OWNER_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)"
