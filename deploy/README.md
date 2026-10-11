# Deploying the Carlton Wellness landing page

## 1. Build the release

From the project root:

```bash
npm run build
```

This refreshes `release/frontend` (the page) and `release/backend` (the API, `schema.sql` and the PM2 file).

## 2. Run on a Linux server (VPS)

Requires Node.js 22.13 or newer.

```bash
# copy release/ to the server, e.g. /opt/carlton-wellness
cd /opt/carlton-wellness/backend
cp .env.example .env            # set ADMIN_TOKEN, adjust PORT / DB_PATH if needed
sudo mkdir -p /var/lib/carlton-wellness && sudo chown $USER /var/lib/carlton-wellness
npm ci --omit=dev
npm install -g pm2
pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
```

Then put nginx in front using `deploy/nginx.conf` and enable HTTPS with certbot.

## 3. Frontend on Vercel, backend elsewhere (optional)

- Deploy `release/frontend` to Vercel as a static site.
- In `frontend/index.html`, set `FORM_ENDPOINT` to the backend's full URL, e.g. `https://api.example.com/api/leads`.
- In the backend's `.env`, set `ALLOWED_ORIGINS=https://your-vercel-domain`.

## Reading leads

```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" https://example.com/api/leads
curl -H "Authorization: Bearer <ADMIN_TOKEN>" "https://example.com/api/leads?format=csv" -o leads.csv
```

Back up the database file (`DB_PATH`) regularly.
