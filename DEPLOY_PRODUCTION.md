# Fierauto — Deploy produzione (Hetzner Ubuntu 26.04)

Documento generato per il deploy Docker del progetto **csmotors** (brand pubblico **Fierauto**, dominio **fierauto.it**).

| Parametro | Valore |
|-----------|--------|
| Server IP | `178.104.184.41` |
| OS | Ubuntu 26.04 |
| Accesso | `ssh root@178.104.184.41` |
| Stack | Docker Compose + Nginx + Certbot + Next.js 16 |

---

## 1. Analisi progetto

### 1.1 Struttura repository

```text
app/                    # Next.js App Router (pagine + API)
components/             # UI React
lib/                    # Store filesystem (listings, hero, logo, trade-in)
data/                   # JSON persistenti (annunci, permute, car-media)
public/                 # Asset statici + upload runtime
deploy/                 # Config produzione (nginx, entrypoint)
scripts/                # Utility build catalogo automotive
Dockerfile
docker-compose.yml
deploy.sh
```

### 1.2 Stack identificato

| Componente | Tecnologia |
|------------|------------|
| **Framework** | Next.js **16.2.6** (App Router) |
| **Frontend** | React **19**, Tailwind CSS **4**, Framer Motion |
| **Backend** | Route API Next.js (`app/api/**`) + Server Components |
| **Database** | **Nessuno** (no PostgreSQL, MySQL, MongoDB) |
| **ORM** | **Nessuno** |
| **Persistenza** | File JSON in `data/` + immagini in `public/uploads/`, `public/hero/`, `public/logo/` |
| **Auth admin** | **Non implementata nel codice** — opzionale HTTP Basic Auth via Nginx (`deploy.sh setup-auth`) |

### 1.3 Dipendenze runtime (`package.json`)

- `next`, `react`, `react-dom`
- `framer-motion`, `lucide-react`
- Build: `typescript`, `tailwindcss`, `eslint` (dev)

### 1.4 Variabili ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|--------------|-------------|
| `NODE_ENV` | Sì | `production` |
| `PORT` | Sì | `3000` (interno container) |
| `OWNER_EMAIL` | Consigliata | Notifiche permuta (`app/api/trade-in/route.ts`); default hardcoded se assente |
| `DOMAIN` | Per deploy | `fierauto.it` (usata da `deploy.sh`) |
| `CERTBOT_EMAIL` | Per SSL | Email Let's Encrypt |
| `ADMIN_HTTP_USER` | Opzionale | Basic auth `/admin` |
| `ADMIN_HTTP_PASSWORD` | Opzionale | Basic auth |

Template: **`.env.production.example`** → copiare in **`.env.production`** sul server.

### 1.5 Pagine e percorsi principali

| Percorso | Ruolo |
|----------|--------|
| `/` | Homepage (annunci pubblicati, hero, contatti) |
| `/inventory/[slug]` | Scheda annuncio |
| `/ritiriamo` | Form permuta |
| `/admin` | Pannello gestione (stessa app Next.js) |
| `/admin/annunci` | CMS annunci |

**Nota:** `/admin` non è un servizio separato — è esposto dallo stesso container `app` dietro Nginx.

### 1.6 API principali

- `GET/POST /api/listings` — annunci
- `POST /api/trade-in` — permuta (pubblico)
- `GET/POST /api/hero`, `/api/logo` — asset sito
- `GET /api/automotive/*` — catalogo marche/modelli

---

## 2. Architettura produzione proposta

```text
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │  Hetzner VPS    │
              │ 178.104.184.41  │
              │  :80 / :443     │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  nginx (Docker) │  TLS, reverse proxy, upload 25MB
              │  + certbot      │  rinnovo SSL automatico
              └────────┬────────┘
                       │ fierauto-internal
              ┌────────▼────────┐
              │  app (Docker)   │  Next.js :3000
              │  fierauto-app   │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   fierauto-data  fierauto-uploads  fierauto-hero
   (volumes Docker persistenti)
```

### Porte

| Porta | Servizio | Esposta su Internet |
|-------|----------|---------------------|
| **80** | Nginx HTTP (redirect / ACME) | Sì |
| **443** | Nginx HTTPS | Sì |
| **3000** | Next.js | **No** (solo rete Docker interna) |
| **22** | SSH | Sì (limitare con firewall) |

**Firewall consigliato (UFW):** `22`, `80`, `443` — tutto il resto chiuso.

### Restart e logging

- **Restart:** `restart: unless-stopped` su tutti i servizi Compose
- **Log:** driver `json-file` con rotazione (`max-size` / `max-file`)
- **Healthcheck:** container `app` verifica HTTP su `127.0.0.1:3000`

### PM2 / ecosystem.config.js

**Non necessario** con Docker. Alternativa bare-metal documentata solo per riferimento: si userebbe `ecosystem.config.js` + PM2 al posto del container `app`.

---

## 3. File creati per il deploy

| File | Scopo |
|------|--------|
| `Dockerfile` | Immagine produzione Node 20, build Next.js |
| `docker-compose.yml` | Stack `app` + `nginx` + `certbot` |
| `.dockerignore` | Esclude `node_modules`, `.next`, env |
| `.env.production.example` | Template variabili |
| `deploy/docker-entrypoint.sh` | Permessi volumi + avvio come utente `nextjs` |
| `deploy/nginx/default.http.conf` | Nginx fase 1 (HTTP + ACME) |
| `deploy/nginx/default.ssl.conf` | Nginx produzione HTTPS |
| `deploy/nginx/nginx.conf` | Copia canonica config HTTPS |
| `deploy/nginx/active.conf` | Config attiva montata nel container |
| `deploy/nginx/admin-auth.conf` | Snippet protezione admin |
| `deploy/nginx/admin-auth-locations.conf` | Snippet runtime (generato da setup-auth) |
| `deploy.sh` | Automazione install/deploy/SSL/auth |
| `DEPLOY_PRODUCTION.md` | Questo documento |

**Modifiche minime al progetto:** solo file di deploy + eccezione in `.gitignore` per `.env.production.example`. **Nessuna modifica al codice applicativo.**

---

## 4. Prerequisiti DNS

Prima di `./deploy.sh ssl`, il registrar deve avere:

| Tipo | Nome | Valore |
|------|------|--------|
| A | `@` | `178.104.184.41` |
| A | `www` | `178.104.184.41` |

Verifica:

```bash
dig +short fierauto.it
dig +short www.fierauto.it
```

---

## 5. Comandi sul server (ordine completo)

### 5.1 Connessione SSH

```bash
ssh root@178.104.184.41
```

### 5.2 Firewall (consigliato)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

### 5.3 Directory progetto

**Opzione A — Git (consigliata)**

```bash
mkdir -p /var/www/fierauto
cd /var/www/fierauto
git clone <URL_REPO_CLIENTE> .
```

**Opzione B — Rsync dal Mac di sviluppo**

```bash
# Sul Mac
cd /Users/testapp/Desktop/csmotors
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  ./ root@178.104.184.41:/var/www/fierauto/
```

### 5.4 Deploy automatico (Docker)

```bash
cd /var/www/fierauto
chmod +x deploy.sh deploy/docker-entrypoint.sh

./deploy.sh install          # Docker Engine + Compose (una volta)
./deploy.sh prepare          # .env.production + nginx HTTP
nano .env.production         # CERTBOT_EMAIL, OWNER_EMAIL, DOMAIN

./deploy.sh up               # Build + avvio (HTTP)
./deploy.sh ssl              # Certificato Let's Encrypt + HTTPS

# Protezione admin (fortemente consigliato)
nano .env.production         # Aggiungi ADMIN_HTTP_USER e ADMIN_HTTP_PASSWORD
./deploy.sh setup-auth
```

### 5.5 Migrazione dati da locale (se già presenti annunci/foto)

**Dal Mac**, dopo il primo `up`:

```bash
cd /Users/testapp/Desktop/csmotors

# Copia nel volume Docker (via cartella temporanea sul server)
rsync -avz data/ root@178.104.184.41:/var/www/fierauto/data/
rsync -avz public/uploads/ root@178.104.184.41:/var/www/fierauto/public/uploads/
rsync -avz public/hero/ root@178.104.184.41:/var/www/fierauto/public/hero/
rsync -avz public/logo/ root@178.104.184.41:/var/www/fierauto/public/logo/

# Sul server — import nei volumi Docker
ssh root@178.104.184.41 'cd /var/www/fierauto && \
  docker compose run --rm --user root -v "$(pwd)/data:/mnt/data:ro" app \
  sh -c "cp -a /mnt/data/. /app/data/" 2>/dev/null || \
  docker compose cp data/. app:/app/data/ 2>/dev/null || true'
```

Metodo più semplice dopo `up`:

```bash
cd /var/www/fierauto
docker compose down
# Assicurati che data/ e public/uploads/ siano nella directory host montata
# I volumi named usano Docker — per seed iniziale:
docker run --rm -v fierauto_fierauto-data:/data -v "$(pwd)/data:/seed:ro" alpine \
  sh -c "cp -a /seed/. /data/"
docker run --rm -v fierauto_fierauto-uploads:/uploads -v "$(pwd)/public/uploads:/seed:ro" alpine \
  sh -c "cp -a /seed/. /uploads/"
docker compose up -d
```

### 5.6 Aggiornamenti successivi

```bash
cd /var/www/fierauto
git pull origin main    # oppure rsync
./deploy.sh update
```

### 5.7 Comandi operativi utili

```bash
./deploy.sh status
./deploy.sh logs
./deploy.sh logs nginx
docker compose ps
docker compose exec app sh -c 'ls -la /app/data/listings'
```

---

## 6. HTTPS e Let's Encrypt

1. `./deploy.sh up` avvia Nginx in modalità **HTTP** (`default.http.conf` → `active.conf`).
2. `./deploy.sh ssl` esegue `certbot certonly --webroot` per `fierauto.it` e `www.fierauto.it`.
3. Lo script passa a **`default.ssl.conf`** e ricarica Nginx.
4. Il servizio **`certbot`** nel Compose rinnova i certificati ogni 12 ore.

Certificati salvati nel volume Docker **`certbot-conf`**.

---

## 7. Frontend pubblico e admin

| Esigenza | Implementazione |
|----------|-----------------|
| Frontend utenti | `https://fierauto.it` → Nginx → `app:3000` |
| Admin | `https://fierauto.it/admin` (stesso container) |
| Separazione logica | Solo path URL + (opzionale) Basic Auth Nginx |
| Upload immagini | `POST` verso API su stesso host; max **25 MB** in Nginx |

---

## 8. Volumi Docker (backup)

| Volume | Contenuto |
|--------|-----------|
| `fierauto-data` | `data/listings`, `data/trade-in`, … |
| `fierauto-uploads` | Foto annunci |
| `fierauto-hero` | Hero homepage |
| `fierauto-logo` | Logo |
| `fierauto-car-uploads` | Upload media legacy |
| `certbot-conf` | Certificati SSL |

**Backup consigliato:**

```bash
docker run --rm -v fierauto_fierauto-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/fierauto-data-$(date +%F).tar.gz -C /data .
```

Ripetere per `fierauto-uploads`, ecc.

---

## 9. Limitazioni note (codice attuale)

- Modulo contatto homepage: **non invia email** (solo UI).
- Permuta: salva file + log; **email non inviata** senza integrazione SMTP futura.
- Admin senza login applicativo: usare **`./deploy.sh setup-auth`**.
- Contatti hardcoded in `HomeContact.tsx` / WhatsApp in `lib/utils.ts` — aggiornare in codice o pianificare refactor env (fuori scope deploy).

---

## 10. Checklist finale go-live

### Infrastruttura
- [ ] DNS `fierauto.it` e `www` → `178.104.184.41`
- [ ] UFW: 22, 80, 443
- [ ] `./deploy.sh install` completato
- [ ] `.env.production` compilato

### Applicazione
- [ ] `./deploy.sh up` — container `app` healthy
- [ ] `./deploy.sh ssl` — HTTPS attivo
- [ ] `https://fierauto.it` carica homepage
- [ ] Annunci e immagini visibili (volumi popolati)
- [ ] `https://fierauto.it/ritiriamo` funziona

### Sicurezza
- [ ] `./deploy.sh setup-auth` eseguito
- [ ] `https://fierauto.it/admin` richiede password
- [ ] Test: `curl -X POST https://fierauto.it/api/listings` senza auth → 401

### Operazioni
- [ ] Backup volumi schedulato
- [ ] Credenziali consegnate al cliente (registrar, VPS, `.env`, admin)
- [ ] `./deploy.sh logs` senza errori critici

### Proprietà cliente
- [ ] Dominio e VPS intestati al cliente
- [ ] Repo GitHub su org cliente
- [ ] Nessun servizio produzione sul tuo account personale

---

## 11. Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| `502 Bad Gateway` | `docker compose ps` — app non healthy; `docker compose logs app` |
| Certbot fallisce | DNS non propagato; verificare `dig fierauto.it` |
| Upload fallisce | Verificare `client_max_body_size`; permessi volumi |
| Nginx non parte | `docker compose logs nginx` — config SSL senza certificato → usare prima `nginx-http` |
| Build lento / OOM | VPS minimo 2 GB RAM consigliati |

---

## 12. Riepilogo comandi rapidi

```bash
ssh root@178.104.184.41
cd /var/www/fierauto
./deploy.sh install && ./deploy.sh prepare && nano .env.production
./deploy.sh up && ./deploy.sh ssl && ./deploy.sh setup-auth
./deploy.sh status
```

**URL finali**

- Sito: https://fierauto.it  
- Admin: https://fierauto.it/admin  
- Annunci: https://fierauto.it/admin/annunci  

---

*Documento allineato al repository al momento del deploy Docker. Per modifiche applicative (SMTP, auth Next.js, contatti da env) pianificare release successive.*
