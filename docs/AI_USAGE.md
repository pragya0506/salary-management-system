# How AI Tooling Was Used

This project was built with an agentic AI coding assistant. This note captures where
AI helped, how it was directed, and how correctness was maintained — since *how* AI is
used is part of the assessment.

## Principles

1. **AI accelerates; the engineer decides.** Architecture (layering, validation
   strategy, error-mapping, pagination approach) was chosen deliberately and then
   implemented with AI, not delegated wholesale.
2. **Verify, don't trust.** Every backend change was exercised with real `curl` calls
   against the running server, and the UI was verified with automated screenshots — not
   assumed to work because it compiled.
3. **Small, reviewable steps** with incremental commits, so the evolution is legible.

## Direction I gave (chronological)

I drove the build with explicit instructions and decisions; the assistant implemented
and verified against them. The intent behind each instruction mattered as much as the
instruction itself.

1. **Diagnose the login 404.** Rather than accept "the endpoint is broken," I had it
   trace the request path end-to-end. It found the route was fine (returned `401`, not
   `404`) and the real cause was a stale, non-reloading backend process.

2. **Build the CSV bulk import.** I specified the behavior I wanted, not just "add
   import":
   - Accept a CSV, **validate every row**, and **import the valid rows even if others
     fail** (partial success) — this mirrors the Excel workflow the HR manager is
     replacing.
   - Return a **per-row error report with row numbers** so bad rows can be fixed and
     re-uploaded.
   - Reuse the *same* validation rules as the single-create endpoint (no divergence).
   - I also called out the **batch ID-generation** concern up front (see bugs below).

3. **Wire up full employee CRUD in the UI.** Add / Edit / Deactivate via modals, with
   backend validation errors surfaced inline next to the fields, and currency
   auto-filled from the selected country to reduce data-entry errors.

4. **Harden the API.** I asked for **Zod input validation** and a **typed error
   middleware** mapping to the right HTTP status (`400` validation, `404` not-found,
   `409` duplicate) — the backend had been passing `req.body` straight to Prisma and
   returning `500` for everything.

5. **Reconcile scope honestly.** When I noticed the requirements doc promised features
   (CSV import, CRUD, status filter) the app didn't yet have, I chose to **build to the
   doc** rather than quietly trim it — and asked for the gap to be laid out explicitly
   before deciding.

6. **Product-quality UI.** "Make the dashboard genuinely useful" → real charts, but
   **dependency-free** (no charting library), plus per-department min–max ranges to
   answer "how do we pay people?" at a glance.

7. **Testing and deliverables.** I asked for meaningful unit tests on both ends and for
   the supporting artifacts (README, architecture notes, this AI-usage note, deployment
   guide) so the submission is reviewable, not just runnable.

## Notable bugs the AI caught and fixed

- **Tailwind not compiling.** Tailwind v4 was installed but wired up with v3 conventions
  (`@tailwind` directives, no Vite plugin), so *no* utility classes were applied and the
  app rendered as unstyled HTML. Fixed by switching to `@import "tailwindcss"` and adding
  the `@tailwindcss/vite` plugin. Found by screenshotting the running app, not by reading
  code.
- **Async errors in Express.** Confirmed the app runs on Express 5, which auto-forwards
  async rejections to the error middleware — so `throw` in controllers is safe. (On
  Express 4 this would have silently hung requests.)
- **Bulk-import ID collisions.** Generating each ID from `count + 1` would collide within
  a single batch; reserved one starting sequence number and incremented per row instead.

## How correctness was maintained

- **Backend:** `curl` matrix run against the live server — valid create (201), invalid
  create (400 + field details), missing record (404), CSV import (207 + row-level error
  report).
- **Frontend:** headless-Chrome screenshots of Login, Dashboard, Employees, and the Add
  modal; console-error capture during the run.
- **Tests:** 20 backend (Jest) + 5 frontend (Vitest) tests, all passing, covering the
  new logic paths.
- **Types:** `tsc --noEmit` clean on both packages.

## Tools

- Agentic coding assistant (Claude) for implementation, diagnosis, and docs.
- Prisma, Zod, TanStack Query, Vitest/Jest as the underlying libraries.
