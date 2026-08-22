# Helix Lab — Laboratory Management System

Full-stack biotechnology laboratory workspace built with Next.js, TypeScript, FastAPI, and PostgreSQL. Authentication supports account registration, login, persistent or browser-session sign-in, protected workspace routes, and token revocation on logout.

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
```

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

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
docker compose config
```

## GitHub Pages

Every push to `main` triggers `.github/workflows/deploy-pages.yml`. Pages exports the frontend as a static site and cannot run FastAPI, PostgreSQL, or Docker. Without an externally hosted API, Login and Register deliberately show an API connection error and protected workspace pages remain inaccessible.

For functional online authentication later, deploy the API and database separately and create a GitHub Actions repository variable named `NEXT_PUBLIC_API_BASE_URL` containing the public API base URL.
