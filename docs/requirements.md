# Salary Management System — Requirements Document

## Background
ACME org has 10,000 employees across multiple countries. 
The HR team currently manages all salary data in Excel 
spreadsheets. This is error-prone, hard to query, and 
doesn't scale. This document defines the requirements 
for a web-based replacement.

## Goal
Build a web application that allows the HR Manager to:
- Manage employee salary records
- Filter and search across the organization
- Answer key questions about how the org pays people
- Replace Excel as the source of truth for salary data

## User Persona
**Primary:** HR Manager
- Non-technical user
- Needs to view, search, update salary records daily
- Needs to answer leadership questions like 
  "what is average salary in Engineering in India?"
- Currently exports Excel, filters manually — very slow

## Features In Scope

### Authentication
- HR Manager login with email + password
- JWT-based session
- Single user role (HR Manager only)

### Employee Management
- View all employees in a paginated table
- Search by name or employee ID
- Filter by department, country, status
- Filter by salary range (min/max)
- Add new employee with salary details
- Edit existing employee salary record
- Deactivate employee (soft delete — data preserved)

### Salary Analytics Dashboard
- Total headcount (active employees)
- Average salary across the org
- Average salary by department (with headcount)
- Average salary by country (with headcount + currency)
- Highest and lowest salary per department

### Data Seeding
- 10,000 realistic employee records across 
  7 departments and 7 countries
- Realistic salary ranges per country

### Bulk Import
- CSV upload to import multiple employees at once
- Validation with error reporting per row
- Replaces the Excel import workflow

## Deliberately Out of Scope

| Feature | Reason |
|---|---|
| Employee self-service portal | Different persona, different product |
| Payroll processing / payslips | Separate financial system concern |
| Multi-role access (admin, viewer) | Single persona in this assessment |
| Audit trail / change history | Phase 2 — adds complexity without core value |
| Real-time multi-user collaboration | Single HR manager, not needed |
| Email notifications | No triggers defined in requirements |
| Performance reviews / bonuses | Out of salary management scope |
| Mobile app | Web is sufficient for HR manager workflow |

## Data Model (Core Fields)

**Employee:**
- Employee ID (ACME-00001 format)
- First name, Last name
- Email
- Department
- Country
- Currency
- Base salary
- Effective date
- Status (ACTIVE / INACTIVE)

## Non-Functional Requirements
- Page load under 2 seconds for employee list (10k records)
- Pagination — 20 records per page, cursor-based
- Works on modern browsers (Chrome, Firefox, Safari)
- Deployed and publicly accessible URL

## Technical Decisions & Trade-offs

**SQLite over PostgreSQL:**
Sufficient for this assessment. Zero ops overhead, 
runs locally with no setup. Production system would 
use PostgreSQL for concurrent writes and better 
tooling. Noted as a known trade-off.

**Prisma ORM:**
Type-safe, auto-generated TypeScript types, 
excellent migration tooling. Worth the abstraction 
for a CRUD-heavy domain. Raw SQL only if complex 
reporting queries arise.

**JWT stateless auth:**
Single HR manager persona — no need for session 
store or refresh token rotation at this scale. 
Simple and sufficient.

**Soft delete over hard delete:**
Salary data has historical value. Deactivating 
preserves records for auditing. Hard deletes lose 
data permanently — wrong choice for HR data.

**Cursor-based pagination over offset:**
10,000 records — offset pagination degrades as 
page number grows. Cursor stays O(log n) regardless 
of position in dataset.

## Success Criteria
- HR Manager can log in and view all employees
- Can filter to answer "show me all Engineering 
  employees in India earning over $80k"
- Analytics dashboard answers org-wide pay questions
  without manual Excel calculation
- CSV import replaces the current Excel workflow
- All core functionality covered by unit tests