# Helix Lab — Laboratory Management System

Full-stack biotechnology laboratory workspace built with Next.js, TypeScript, FastAPI, and PostgreSQL. Authentication supports account registration, login, persistent or browser-session sign-in, protected workspace routes, and token revocation on logout. The workspace also includes persistent Gemini-assisted conversations, secure laboratory file attachments, and downloadable PDF/XLSX reports generated from database records.

## Run the full stack with Docker

Docker Desktop must be running. From the repository root:

```powershell
docker compose up --build
```

Services are available at:

- Web application: <http://localhost:3000/login>
- REST API: <http://localhost:8000>
- Interactive API documentation: <http://localhost:8000/docs>
- PostgreSQL: `localhost:5432`

The default development manager account is:

```text
Username: admin
Email: admin@helixlab.io
Password: Admin123!
```

Override the development defaults with a local `.env` file:

```dotenv
WEB_PORT=3000
API_PORT=8000
POSTGRES_PORT=5432
POSTGRES_DB=helixlab
POSTGRES_USER=helix
POSTGRES_PASSWORD=replace-me
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@helixlab.io
SEED_ADMIN_PASSWORD=replace-me
GEMINI_API_KEY=replace-with-a-google-ai-studio-key
GEMINI_MODEL=gemini-3.6-flash
SEED_DEMO_DATA=true
```

Keep `.env` local; it is ignored by Git. Never put the Gemini key in a `NEXT_PUBLIC_*` variable because those values are compiled into browser JavaScript. Rotate any key that has been pasted into chat or another public location before deployment.

The API URL is compiled into the frontend image because `NEXT_PUBLIC_*` variables are browser-visible build-time values. It must be a URL the user's browser can reach; do not set it to the Compose service name `api`.

To stop containers while keeping database data:

```powershell
docker compose down
```

To remove the PostgreSQL volume as well:

```powershell
docker compose down --volumes
```

## Local frontend development

Run PostgreSQL and the API through Docker, then run Next.js with hot reload:

```powershell
docker compose up db api
npm install
npm run dev -- -p 3001
```

The default API CORS configuration allows both ports 3000 and 3001.

## AI Assistant and reports

The AI Assistant stores conversations in PostgreSQL and accepts PDF, PNG, JPEG, WebP, CSV, and XLSX attachments. Files are stored in the private `helixlab_ai_uploads` Docker volume, not served as public static files. Each message is limited to 3 files, 8 MB per file, and 15 MB total.

Reports can be created as Thai or English PDF/XLSX files from the Reports page. Experiment Summary, Sample Inventory, and Quality Control templates use a persisted database snapshot so a previously created report remains reproducible. AI summaries are optional; file generation still works if Gemini is unavailable.

## Temporary Cloudflare quick tunnel

After the stack is healthy, create an API tunnel first:

```powershell
cloudflared tunnel --url http://localhost:8000
```

Set the resulting HTTPS URL as `NEXT_PUBLIC_API_BASE_URL=https://<api-tunnel>.trycloudflare.com/api/v1`, rebuild the web image, and then start a second terminal for the frontend:

```powershell
docker compose build web
docker compose up -d web
cloudflared tunnel --url http://localhost:3000
```

Add the frontend tunnel URL to `CORS_ORIGINS` and recreate the API container. Quick-tunnel URLs change whenever `cloudflared` restarts and are intended only for temporary sharing.

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
docker compose config
docker run --rm --env PYTHONPATH=/app --mount type=bind,source=${PWD}/api/tests,target=/app/tests,readonly slmp-api pytest -q -p no:cacheprovider tests
```

## GitHub Pages

Every push to `main` triggers `.github/workflows/deploy-pages.yml`. Pages exports the frontend as a static site and cannot run FastAPI, PostgreSQL, or Docker. Without an externally hosted API, Login and Register deliberately show an API connection error and protected workspace pages remain inaccessible.

For functional online authentication later, deploy the API and database separately and create a GitHub Actions repository variable named `NEXT_PUBLIC_API_BASE_URL` containing the public API base URL.

Static preview: <https://biotech-lab-system.github.io/Web-Application-Development-Frontend-/login/>
