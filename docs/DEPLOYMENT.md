# Deployment

The app is two deployables: a Node/Express API and a static React bundle. No Docker
required — any Node host + static host works.

## Build outputs

```bash
# Backend → compiled JS in backend/dist, started with `node dist/server.js`
cd backend && npm install && npm run build

# Frontend → static files in frontend/dist (serve as static assets)
cd frontend && npm install && npm run build
```

## Recommended hosted setup (free tiers)

**Backend → [Render](https://render.com) (or Railway / Fly.io / any Node host)**

- Root directory: `backend`
- Build command: `npm install && npm run build && npx prisma migrate deploy`
- Start command: `node dist/server.js`
- Add a **persistent disk** mounted at e.g. `/data` for the SQLite file.
- Environment variables:

  | Var | Value |
  |---|---|
  | `DATABASE_URL` | `file:/data/dev.db` |
  | `JWT_SECRET` | a long random string |
  | `PORT` | provided by the platform |

- Seed once from the platform shell: `npm run seed`.

**Frontend → [Vercel](https://vercel.com) / [Netlify](https://netlify.com)**

- Root directory: `frontend`
- Build command: `npm run build`, output directory: `dist`
- Proxy `/api/*` to the backend URL so the browser uses one origin and avoids CORS:
  - **Netlify** (`frontend/netlify.toml` or a `_redirects` file):
    ```
    /api/*  https://<your-backend>.onrender.com/api/:splat  200
    ```
  - **Vercel** (`frontend/vercel.json`):
    ```json
    { "rewrites": [{ "source": "/api/:path*", "destination": "https://<your-backend>.onrender.com/api/:path*" }] }
    ```

## First login (after deploy)

```bash
curl -X POST https://<your-backend>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@acme.com","password":"password123"}'
```

## Production note

SQLite is single-writer and file-based — fine for this single-HR-user assessment with a
persistent disk. For real multi-writer production, switch `provider` to `postgresql` in
`prisma/schema.prisma` and point `DATABASE_URL` at a managed Postgres instance. No
application-code changes are needed thanks to the repository layer.
