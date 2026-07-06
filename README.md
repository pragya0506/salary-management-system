# ACME Salary Management System

A web application that lets an HR Manager manage salary data for ~10,000 employees
across multiple countries — replacing the current Excel-based workflow. Built with a
TypeScript/Express + Prisma/SQLite backend and a React + Vite frontend.

> **Product framing, scope, and trade-offs** are documented in
> [`docs/requirements.md`](docs/requirements.md). **Architecture** is in
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). **How AI tooling was used** is in
> [`docs/AI_USAGE.md`](docs/AI_USAGE.md).

---

## Features

- **Authentication** — HR Manager login, JWT-based sessions.
- **Employee management** — paginated, searchable, filterable list (name/ID search;
  department, country, status, and salary-range filters). Add, edit, and deactivate
  (soft-delete) employees.
- **Bulk CSV import** — upload a CSV of employees; each row is validated and a per-row
  error report is returned so bad rows can be fixed and re-uploaded.
- **Analytics dashboard** — org headcount, average/min/max salary, average salary by
  department (with headcount and min–max range) and by country (with currency).
- **10,000-employee seed** across 7 departments and 7 countries with
  country-appropriate salary ranges and currencies.

## Tech stack & why

| Layer | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** (both ends) | Type safety across the stack; shared mental model. |
| API | **Express 5** | Minimal, well-understood; Express 5 auto-forwards async errors. |
| ORM / DB | **Prisma + SQLite** | Zero-ops for an assessment; type-safe queries and migrations. Swappable to Postgres by changing the datasource. |
| Validation | **Zod** | One schema drives create/update and CSV import; produces field-level error messages. |
| Frontend | **React + Vite** | Fast dev server, modern tooling. |
| Data fetching | **TanStack Query** | Caching, background refetch, and mutation/invalidation without hand-rolled state. |
| Styling | **Tailwind CSS v4** | Utility-first; fast to build a consistent, responsive UI. *(A CSS framework rather than a component library — chosen for full control over a small, bespoke UI surface.)* |
| Backend tests | **Jest** | Service-layer unit tests with a mocked repository. |
| Frontend tests | **Vitest + Testing Library** | Component behavior tests (happy-dom environment). |

## Project structure

```
backend/
  prisma/
    schema.prisma        # Employee + User models, EmployeeStatus enum
    seed.ts              # seeds 10,000 employees
  src/
    controllers/         # HTTP layer (request/response)
    services/            # business logic (validation, ID generation, CSV import)
    repositories/        # Prisma data access
    middleware/          # auth (JWT) + typed error handler
    validation/          # Zod schemas
    routes/              # Express routers
    errors.ts            # typed AppError / NotFoundError / ValidationError
  tests/                 # Jest unit tests
frontend/
  src/
    pages/               # Login, Dashboard, Employees
    components/          # Layout, Modal, EmployeeFormModal, ImportModal
    services/api.ts      # axios client + endpoint wrappers
    lib/constants.ts     # departments, countries, currency map
docs/                    # requirements, architecture, AI usage
```

## Prerequisites

- **Node.js 20.19+ or 22.12+** (Vite 8 requirement) and npm.

## Setup & run (local)

Two terminals — backend and frontend.

### 1. Backend (`http://localhost:3000`)

```bash
cd backend
npm install
cp .env.example .env            # then edit JWT_SECRET
npx prisma migrate deploy       # apply the SQLite schema
npm run seed                    # seed 10,000 employees
npm run dev                     # start API on :3000
```

### 2. Frontend (`http://localhost:5173`)

```bash
cd frontend
npm install
npm run dev                     # Vite proxies /api -> :3000
```

Open **http://localhost:5173**.

### First login

The seed creates employees but no login user. Create one:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@acme.com","password":"password123"}'
```

Then sign in with those credentials.

## Running tests

```bash
cd backend  && npm test     # Jest — service + import + validation tests
cd frontend && npm test     # Vitest — component tests
```

## CSV import format

Header row required; columns:

```
firstName,lastName,email,department,country,currency,baseSalary,effectiveDate
Jane,Doe,jane@acme.com,Engineering,US,USD,90000,2024-01-15
```

A sample file is provided at [`docs/sample-employees.csv`](docs/sample-employees.csv).
Valid rows import even if others fail; failures are returned with row numbers.

## API overview

All `/api/employees` and `/api/analytics` routes require a `Bearer` token.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create a login user |
| POST | `/api/auth/login` | Get a JWT |
| GET | `/api/employees` | List (filters: `search, department, country, status, minSalary, maxSalary, cursor`) |
| POST | `/api/employees` | Create (Zod-validated) |
| PUT | `/api/employees/:id` | Update |
| DELETE | `/api/employees/:id` | Deactivate (soft delete) |
| POST | `/api/employees/import` | Bulk CSV import |
| GET | `/api/analytics/summary` | Headcount + avg/min/max |
| GET | `/api/analytics/by-department` | Avg/min/max/count per department |
| GET | `/api/analytics/by-country` | Avg + count per country |

## Deployment

Deploys as a Node API + a static React bundle (no Docker required). See
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for hosted setup (e.g. Render + Vercel/Netlify)
and environment variables.
