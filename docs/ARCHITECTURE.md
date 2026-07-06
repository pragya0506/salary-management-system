# Architecture

## Overview

```
┌──────────────────────┐        HTTP / JSON         ┌───────────────────────────┐
│      Frontend        │  ───────────────────────▶  │         Backend           │
│  React + Vite        │   /api/*  (JWT bearer)     │  Express 5 (TypeScript)   │
│                      │  ◀───────────────────────  │                           │
│  pages/  components/ │                            │  routes → controllers →   │
│  TanStack Query      │                            │  services → repositories  │
└──────────────────────┘                            └────────────┬──────────────┘
        proxy /api → :3000                                        │ Prisma
                                                        ┌─────────▼──────────┐
                                                        │   SQLite (dev.db)  │
                                                        └────────────────────┘
```

## Backend layering

The backend is deliberately split into thin, single-responsibility layers so that
business logic is isolated from HTTP and from the database — which is what makes the
service layer straightforward to unit-test with a mocked repository.

| Layer | Responsibility | Knows about |
|---|---|---|
| **routes** | URL → handler wiring, auth middleware | Express |
| **controllers** | Parse request, shape response, set status codes | `req`/`res`, services |
| **services** | Business logic: validation, employee-ID generation, CSV import, soft-delete rules | validation schemas, repository, domain errors |
| **repositories** | Data access via Prisma; builds `where` clauses, pagination | Prisma only |
| **middleware** | JWT auth; centralized error → HTTP status mapping | — |

**Data flow (create employee):**
`POST /api/employees` → `authenticate` → `employeeController.create` →
`employeeService.createEmployee` (Zod-validates, generates `ACME-#####` id) →
`employeeRepository.create` → Prisma → SQLite. Errors bubble up and are translated by
the error middleware.

## Key design decisions

- **Validation lives in the service, once.** A single Zod schema
  (`validation/employee.schema.ts`) validates the create endpoint, the update endpoint
  (as a partial), and every CSV row. One rule set, no drift.
- **Typed errors → correct HTTP statuses.** `errors.ts` defines
  `NotFoundError` (404) and `ValidationError` (400); the error middleware also maps
  `ZodError` → 400 (with field details) and Prisma `P2002` (unique constraint) → 409.
  Everything else is a 500. Express 5 forwards async rejections automatically, so
  controllers can simply `throw`.
- **Cursor pagination.** `findMany` fetches `limit + 1` rows and derives
  `hasMore`/`nextCursor`. Stays O(log n) at any offset into 10k rows, unlike
  `OFFSET`-based paging.
- **Soft delete.** Deactivation flips `status` to `INACTIVE` rather than deleting —
  salary history is retained, and analytics filter on `status = ACTIVE`.
- **CSV import is partial-success.** Valid rows are inserted; invalid or
  duplicate-email rows are collected into a per-row error report. IDs are generated
  from a single reserved starting sequence so a batch doesn't collide on `count + 1`.
  Returns `207` when some rows fail, `201` when all succeed.

## Frontend

- **Pages**: `Login`, `Dashboard` (analytics + CSS bar charts), `Employees` (table,
  filters, CRUD modals, CSV import).
- **TanStack Query** owns server state. Mutations (create/update/deactivate/import)
  invalidate the `employees` and analytics query keys so the UI refetches automatically.
- **axios instance** injects the JWT from `localStorage` and redirects to `/login` on a
  401.
- **Charts are dependency-free** — CSS/flex bars following a single-hue magnitude
  encoding, so no charting library is pulled in.

## Testing strategy

- **Backend (Jest):** service layer with the repository mocked — fast and deterministic,
  no DB. Covers CRUD rules, ID generation, validation rejection, and CSV import
  (valid/invalid/duplicate/parse-failure paths).
- **Frontend (Vitest + Testing Library):** behavior of the employee form — currency
  auto-fill, numeric coercion on submit, backend field-error rendering, and add-vs-edit
  mode.

## Known trade-offs / next steps

- **SQLite** is single-writer; production would use Postgres (swap the Prisma
  datasource). SQLite's `contains` filter is case-sensitive — acceptable here, would use
  Postgres `ilike` in production.
- **By-country chart** compares raw local-currency values; a production version would
  normalize to a base currency via an FX table.
- **Single role** (HR Manager). Multi-role access, audit trail, and payroll are
  explicitly out of scope (see `requirements.md`).
