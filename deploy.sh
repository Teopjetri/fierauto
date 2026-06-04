#!/usr/bin/env bash
# Fierauto — production deploy helper (Docker Compose)
# Run on the server from the project root: /var/www/fierauto

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

COMPOSE="docker compose"
ENV_FILE=".env.production"

log() { printf '\n\033[1;36m==>\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

load_env() {
  [[ -f "$ENV_FILE" ]] || die "Create $ENV_FILE from .env.production.example"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  : "${DOMAIN:=fierauto.it}"
  : "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in $ENV_FILE}"
}

nginx_http() {
  cp deploy/nginx/default.http.conf deploy/nginx/active.conf
  log "Nginx config: HTTP (active.conf)"
}

nginx_ssl() {
  cp deploy/nginx/default.ssl.conf deploy/nginx/active.conf
  log "Nginx config: HTTPS (active.conf)"
}

cmd_install() {
  require_cmd docker
  log "Installing Docker Engine (Ubuntu)..."
  apt-get update
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${VERSION_CODENAME:-$VERSION_ID}") stable" \
    | tee /etc/apt/sources.list.d/docker.list >/dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin apache2-utils
  systemctl enable docker
  systemctl start docker
  log "Docker installed: $(docker --version)"
}

cmd_prepare() {
  if [[ -f .env.production ]]; then
    load_env
  else
    cp .env.production.example .env.production
    log "Created .env.production — edit before production traffic"
  fi
  mkdir -p deploy/nginx
  if [[ ! -f deploy/nginx/.htpasswd ]]; then
    require_cmd htpasswd
    htpasswd -bc deploy/nginx/.htpasswd _placeholder_ "$(openssl rand -hex 16)" >/dev/null
    log "Placeholder .htpasswd created (replaced by setup-auth)"
  fi
  nginx_http
  log "Environment ready. Edit .env.production then run: ./deploy.sh up"
}

cmd_build() {
  require_cmd docker
  load_env
  log "Building application image..."
  $COMPOSE build --no-cache app
}

cmd_up() {
  require_cmd docker
  load_env
  nginx_http
  log "Starting stack (HTTP)..."
  $COMPOSE up -d --build
  $COMPOSE ps
  log "App logs: $COMPOSE logs -f app"
}

cmd_ssl() {
  require_cmd docker
  load_env
  if [[ "$DOMAIN" != "fierauto.it" ]]; then
    log "DOMAIN=$DOMAIN — ensure DNS A record points to this server"
  fi
  log "Requesting Let's Encrypt certificate for $DOMAIN and www.$DOMAIN ..."
  $COMPOSE run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"
  nginx_ssl
  $COMPOSE up -d nginx
  $COMPOSE exec nginx nginx -s reload || true
  log "HTTPS enabled. Test: https://$DOMAIN"
}

cmd_setup_auth() {
  require_cmd docker
  load_env
  : "${ADMIN_HTTP_USER:?Set ADMIN_HTTP_USER in $ENV_FILE}"
  : "${ADMIN_HTTP_PASSWORD:?Set ADMIN_HTTP_PASSWORD in $ENV_FILE}"
  require_cmd htpasswd
  htpasswd -bc deploy/nginx/.htpasswd "$ADMIN_HTTP_USER" "$ADMIN_HTTP_PASSWORD"
  cp deploy/nginx/admin-auth.conf deploy/nginx/admin-auth-locations.conf
  nginx_ssl
  sed -i 's|# include /etc/nginx/admin-auth-locations.conf;|include /etc/nginx/admin-auth-locations.conf;|' deploy/nginx/active.conf
  $COMPOSE up -d nginx
  $COMPOSE exec nginx nginx -s reload
  log "HTTP Basic Auth enabled for /admin and write APIs"
}

cmd_update() {
  require_cmd docker
  load_env
  log "Pull/build and restart..."
  $COMPOSE build app
  $COMPOSE up -d
  $COMPOSE ps
}

cmd_logs() {
  require_cmd docker
  $COMPOSE logs -f "${2:-app}"
}

cmd_status() {
  require_cmd docker
  $COMPOSE ps
  curl -sI "http://127.0.0.1" | head -5 || true
}

cmd_down() {
  require_cmd docker
  $COMPOSE down
}

cmd_help() {
  cat <<'EOF'
Fierauto deploy.sh

  ./deploy.sh install      Install Docker (Ubuntu, run as root once)
  ./deploy.sh prepare      Copy env template, set HTTP nginx config
  ./deploy.sh build        Build app image
  ./deploy.sh up           Start stack (HTTP) — requires DNS → server IP
  ./deploy.sh ssl          Obtain Let's Encrypt cert + switch to HTTPS
  ./deploy.sh setup-auth   Protect /admin (requires ADMIN_HTTP_* in .env)
  ./deploy.sh update       Rebuild and restart after git pull
  ./deploy.sh logs [svc]   Follow logs (default: app)
  ./deploy.sh status       Compose PS + quick curl
  ./deploy.sh down         Stop all containers

Typical first deploy:
  ./deploy.sh install
  ./deploy.sh prepare
  nano .env.production
  ./deploy.sh up
  ./deploy.sh ssl
  ./deploy.sh setup-auth
EOF
}

main() {
  case "${1:-help}" in
    install) cmd_install ;;
    prepare) cmd_prepare ;;
    build) cmd_build ;;
    up) cmd_up ;;
    ssl) cmd_ssl ;;
    setup-auth) cmd_setup_auth ;;
    update) cmd_update ;;
    logs) cmd_logs "$@" ;;
    status) cmd_status ;;
    down) cmd_down ;;
    nginx-http) nginx_http ;;
    nginx-ssl) nginx_ssl ;;
    help|-h|--help) cmd_help ;;
    *) die "Unknown command: $1 (try ./deploy.sh help)" ;;
  esac
}

main "$@"
