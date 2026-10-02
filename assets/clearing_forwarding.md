# Ebunilo Igwilo — Portfolio Case Study: ClearPort

> Source material for the portfolio website. Everything below comes from the ClearPort codebase,
> its product spec, and its delivery history. Copy sections as they are, or trim them for cards and
> summaries.

---

## One-line summary

**ClearPort** is a mobile-first, multi-tenant SaaS platform for Nigerian clearing & forwarding agents
and customs-bonded terminals. It digitises the full import-clearance lifecycle, from Form M to empty
container return, and runs it on a double-entry accounting core. Field staff can keep working
offline in port areas with no signal.

**Live:** https://clearport.caltech-ltd.com

**My role:** Sole engineer, end to end: domain research, product specification, data modelling,
backend, frontend/PWA, accounting design, testing, CI/CD, containerisation and production deployment.

---

## Short versions (for cards / hero sections)

**25 words:**
Built ClearPort, a full-stack, offline-capable PWA that runs Nigerian port and bonded-terminal customs
clearance, from paperwork to payments, for multi-branch clearing agencies.

**50 words:**
Designed and shipped ClearPort, a multi-tenant SaaS for clearing & forwarding agencies. It encodes 20-
and 25-stage customs workflows as data, enforces role- and scope-based access for 12 staff roles, runs a
Nigerian-tax-aware double-entry ledger, and lets field staff queue stage updates and photos offline,
with exactly-once sync when signal returns.

---

## The problem

Nigerian clearing agents move containers through a long chain of agencies and portals: banks (Form M),
Customs' B'Odogwu system (PAAR, SGD, C-number, release), shipping lines, terminal operators, gate
officers and, for bonded cargo, a further chain of Customs units (CPC, Enforcement, FOU, DC Revenue).
Today most agencies run this on Excel trackers, paper expense slips and WhatsApp groups. The result:

* **Money leaks.** Shipping-line demurrage (₦48k–₦100k per container per day) and terminal storage
  pile up because nobody sees the free-day clock running out.
* **No single job file.** Operations, documents and finance live in different places, so unbilled
  disbursements and unprofitable jobs go unnoticed.
* **Field staff have no signal.** Port areas have poor coverage, so updates arrive late or not at all.
* **Tax rules are easy to get wrong.** VAT applies to agency fees but not to pass-through
  disbursements, corporate customers withhold WHT, and e-invoicing is now mandatory.

## The solution

One job file per consignment that operations, documentation, field staff, accounts and management all
work from, on whatever device each role actually uses.

* **Workflows as data.** Two clearance processes: Port Import (20 stages) and Bonded Import
  (25 stages). Each is declared as data. Every stage lists the documents and fields it requires and
  the permission needed to complete it. A stage can't be completed until its requirements are met,
  unless an authorised override is recorded.
* **Free-day clocks per container** for terminal storage and shipping-line demurrage, with alerts at
  3, 1 and 0 days left. Form M expiry is tracked the same way.
* **Integrated accounting.** Invoicing, receipts, disbursements, container deposits, refunds and
  expenses post directly to a double-entry general ledger, so job profitability and AR aging are
  always current.
* **Offline-first field app.** Field staff complete stages and capture photo and GPS evidence with no
  signal. The updates sync safely when the connection returns.
* **Role dashboards** for management, port, warehouse (bonded yard), documentation, field, accounts,
  sales and marketing.

---

## Key features

### Operations
* Job records holding the shipment, customs references (Form M, PAAR, SGD, C-number, lane, release),
  containers, documents, stage timeline, tasks and costs
* Port Import (20 stages) and Bonded Import (25 stages) workflows with per-stage document checklists
  that block progress until the required documents are in
* Stage completion carries notes, photo evidence, GPS coordinates and timestamps; reverts and
  overrides need a separate permission and are audited
* Per-container terminal storage and demurrage countdowns; Form M expiry alerts
* Task assignment to field staff with due dates ("My tasks today")

### Accounting (Nigerian context)
* Double-entry general ledger with a seeded, editable Nigerian chart of accounts
* Invoices with **VAT 7.5% on fees only**; disbursements pass through without VAT
* WHT credit handling, customer advances, receipts, credit notes, and voids posted as reversing
  entries. Posted journals are never edited.
* Job disbursements, container deposits and refunds with damage deductions posted as losses
* Customer refunds with **two-person approval**, expense approval thresholds, accounting period lock
* All money stored as `NUMERIC(18,2)`, never floating point

### Reporting
* Trial balance, P&L, balance sheet, general ledger, AR aging, customer statements
* **Job profitability**, which surfaces disbursements that haven't been billed
* Dashboards per role: average clearance days, revenue month-to-date against last month, demurrage
  exposure, bank balances, yard occupancy and dwell time, paperwork queue, and more

### Access control & multi-tenancy
* One deployment serves many agencies, and every tenant-owned row is scoped by `organization_id`
* 45+ fine-grained permission codes, grouped into editable roles. There are 12 default roles: admin,
  management, operations manager, port supervisor, warehouse supervisor, documentation officer,
  field staff, accountant, cashier, sales, marketing, and customer portal.
* **Data scope** per role (own / branch / org) is applied in the query layer. Customers only ever see
  their own jobs.
* Audit log of sensitive actions, recording who did it, when, and from which IP or GPS location

### Communication
* In-app notifications with an outbound queue and pluggable SMS / WhatsApp / email / push adapters
* Per-user channel preferences, job chat threads, direct messages, broadcast announcements, @mentions

---

## Engineering highlights (talking points for interviews)

### 1. Offline sync with exactly-once delivery
Ports have poor signal, so the PWA has to keep working without a connection.
* The service worker precaches the app shell, and API reads are network-first with a 6 s timeout,
  falling back to the last cached response.
* Stage completions and photo/document uploads go into **one ordered outbox**. Queue metadata lives
  in `localStorage` and files in **IndexedDB**. Order matters: a required photo uploads before the
  stage that needs it.
* Every queued write carries an **`Idempotency-Key`**. The server stores it with a uniqueness
  constraint on the resulting record and returns the original result for a repeat. A retry after a
  lost response never advances a stage twice or stores a photo twice.
* Errors are classified carefully. A 4xx response from the server is reported and the update dropped.
  Network failures, 5xx, 408, 429 and expired sessions (401) keep the update, and everything after
  it, in order.
* **Updates belong to the user who made them.** On a shared phone, one person's updates and GPS
  readings are never sent under another person's login.
* Sync triggers on reconnect, on app start, and on a 30 s retry timer, because weak signal often
  never fires an `online` event.

### 2. Domain-driven workflow engine
Customs processes are encoded as declarative stage definitions (required docs, required fields,
completing permission) rather than hard-coded screens. New workflows or regulatory changes become data
changes, not rewrites.

### 3. Accounting built by accounting rules
Every business event (advance, disbursement, deposit, invoice, payment, refund, expense, credit note)
maps to an explicit debit/credit posting. Journals are immutable, corrections are reversals, and
periods can be locked. The test suite checks that the ledger balances after every accounting flow.

### 4. Security by default
JWT access and refresh tokens, bcrypt password hashing, and per-tenant isolation enforced in the data
layer. Records from another tenant return 404, so their existence isn't revealed. Containers run as
non-root, only one port is published and it is bound to localhost behind a TLS reverse proxy, and
CI/CD validates the strength of deployment secrets.

### 5. Research-led product spec
Before building, I researched the 2025–2026 Nigerian regulatory landscape: B'Odogwu replacing
NICIS II, the National Single Window, the Automated Transire Process, customs lanes, the Nigeria Tax
Act 2025 and e-invoicing (Peppol UBL). I also studied comparable products (CargoWise, Magaya, SMB
forwarders). The resulting spec flags each gap it found in the original domain brief and phases the
roadmap.

---

## Architecture

```
 Phone / desktop (installable PWA)
   React 19 · TypeScript · TanStack Query · Service worker + offline outbox
          │  HTTPS
          ▼
 Host nginx (TLS, Let's Encrypt wildcard)
          ▼
 ┌──────────── Docker Compose (private network) ───────────┐
 │  web: nginx serving the PWA, proxying /api               │
 │  api: FastAPI · SQLAlchemy 2 · Alembic · Uvicorn         │
 │  db:  PostgreSQL 16 (named volume)                       │
 │  uploads volume (S3-compatible storage planned)          │
 └──────────────────────────────────────────────────────────┘
```

Backend layering: `api/` (HTTP routers) → `services/` (domain logic: jobs, accounting, reports,
notifications) → `models/` (SQLAlchemy) with Pydantic `schemas/`, `core/` (config, security,
permissions, dependency injection), and `workflows.py` (stage definitions as data).

---

## Tech stack

| Area | Technologies |
| --- | --- |
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2.0 (typed ORM), Alembic migrations, Pydantic v2 / pydantic-settings, PyJWT, bcrypt, Uvicorn |
| **Database** | PostgreSQL 16 (psycopg 3), exact-decimal money, unique constraints for idempotency |
| **Frontend** | React 19, TypeScript 6, Vite 8, React Router, TanStack Query 5, Tailwind CSS v4, lucide-react, hand-built accessible SVG/HTML charts (no chart library) |
| **PWA / offline** | vite-plugin-pwa (Workbox), service worker precache and runtime caching, IndexedDB, `localStorage`, `useSyncExternalStore` |
| **Testing & quality** | pytest with httpx (end-to-end API tests against real Postgres), Ruff (lint and format), oxlint, strict TypeScript |
| **DevOps** | Docker (multi-stage, non-root, health checks), Docker Compose, nginx, GitHub Actions CI/CD, GitHub Container Registry, SSH-based deployment, Let's Encrypt TLS, uv package manager |

---

## Skills demonstrated

**Software engineering**
* Full-stack product development, from blank repo to production
* REST API design with FastAPI; typed Python (3.13 generics, `StrEnum`, `Annotated` dependencies)
* Relational data modelling: multi-tenant schemas, audit trails, constraints, migrations
* Modern React: hooks, server-state caching, external-store subscriptions, error boundaries
* Offline-first and distributed-systems thinking: idempotency, ordered retries, failure classification
* Mobile-first, accessible UI (44 px tap targets, works on low-end Android over 3G, screen-reader
  table views for charts)

**Security & architecture**
* Authentication (JWT access and refresh tokens) and authorisation (RBAC with data scopes)
* Tenant isolation, audit logging, approval workflows (maker-checker)
* Designing extension points: pluggable notification channels, and integration ports for customs and
  e-invoicing APIs that are expected later

**Finance / fintech domain**
* Double-entry bookkeeping, chart-of-accounts design, immutable journals and reversals, period close
* Tax-aware invoicing (VAT on fees only, WHT), AR aging, financial statements, job costing and
  profitability

**Logistics domain**
* Nigerian import clearance end to end: Form M, PAAR, SGD/duty, examination, release, TDO, exit/gate,
  delivery, empty return and deposit refund
* Customs-bonded terminal operations: transire, CPC, Enforcement, FOU, DC Revenue, transfer, yard
  management
* Demurrage and storage cost control

**DevOps & delivery**
* CI pipeline: lint, migrations applied to an empty database, test suite, type-check, production build
* CD pipeline: versioned images (`sha-<commit>`) pushed to GHCR, zero-touch deploy over SSH, health-
  gated rollout, one-line rollback to an earlier image tag
* Production hardening: secrets validation, localhost-only port binding, reverse proxy with TLS
  termination, persistent volumes, backup procedure

**Product & analysis**
* Turning an informal domain brief from a business owner into a structured product specification
* Regulatory and competitor research, gap analysis, phased roadmap (MVP → integrations)
* Role and persona design for 12 user types across mobile and desktop

---

## By the numbers

| | |
| --- | --- |
| Clearance workflows | 2 (Port Import: 20 stages · Bonded Import: 25 stages) |
| Default user roles | 12 |
| Permission codes | 45+ |
| Role dashboards | 8 (management, port, warehouse, documentation, field, accounts, sales, marketing) |
| Financial reports | 7 (trial balance, P&L, balance sheet, ledger, AR aging, customer statement, job profitability) |
| Application code | ~11,000 lines (Python + TypeScript) |
| Delivery | Feature-branch PRs, CI on every push/PR, auto-deploy from `main` |

---

## Roadmap (shows product thinking)

* **Phase 2:** quotations and rate cards with quote-to-job conversion, customer portal and public
  tracking links, real SMS/WhatsApp/push providers, bank reconciliation, bonded storage tariff billing,
  approvals UI
* **Phase 3:** B'Odogwu / National Single Window integrations once their APIs are exposed, NRS
  e-invoicing (UBL) export, exports and air freight, OCR on documents

---

## Suggested portfolio tags

`Full-Stack` · `Python` · `FastAPI` · `PostgreSQL` · `React` · `TypeScript` · `PWA` · `Offline-First` ·
`Multi-Tenant SaaS` · `RBAC` · `Double-Entry Accounting` · `Fintech` · `Logistics` · `Docker` ·
`GitHub Actions` · `CI/CD` · `nginx` · `Product Design`
