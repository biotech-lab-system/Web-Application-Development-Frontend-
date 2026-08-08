# Helix Lab — Laboratory Management Frontend

Frontend prototype for a modern biotechnology laboratory management system. Built with Next.js, TypeScript, Tailwind CSS, Lucide, and Recharts using mock data and local UI state only.

## Local development

```powershell
npm install
npm run dev -- -p 3001
```

Open <http://localhost:3001/login>.

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
```

## REST API (Core MVP)

The backend implementation lives in `api/` and runs with a PostgreSQL container through
Docker Compose. Compose provides development defaults; set local values in `.env` when
you need to override them.

```powershell
docker compose up --build
```

The API is available at <http://localhost:8000> and interactive documentation is at
<http://localhost:8000/docs>. The default development seed account is controlled by
`SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` in `.env`.

To stop the services while keeping the database volume:

```powershell
docker compose down
```

## Deployment

Every push to `main` triggers the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.

https://biotech-lab-system.github.io/Web-Application-Development-Frontend-/login/
