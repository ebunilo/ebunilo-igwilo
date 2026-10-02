# Ebunilo Igwilo: Fleet and Finance Platform for a Haulage Company (Odoo 19)

## Summary

I designed, built and run a set of custom Odoo 19 modules that turn a trucking company's daily operations into correct accounting. These operations are truck dispatches, fuel purchases, driver cash advances, workshop maintenance and spare-part control. Every trip, litre of diesel, spare part and transport invoice now reaches the general ledger tagged with the truck it belongs to. Management can therefore see **profit per truck**, **what is owed to each fuel station**, and **when each truck last had a part replaced** before approving another one.

I owned the whole lifecycle:
- requirements analysis with the business;
- solution architecture and trade-off evaluation;
- data modelling;
- implementation and automated testing;
- documentation;
- a release pipeline to a Dockerised production server with backups and verified upgrades.

| | |
| --- | --- |
| **Role** | Solution architect and lead developer (sole engineer) |
| **Domain** | Logistics / road haulage, fleet operations, financial accounting, inventory |
| **Platform** | Odoo 19 Community (Python ERP framework) on PostgreSQL |
| **Scope** | 3 custom modules integrated with 5+ standard and third-party Odoo modules |
| **Size** | ~2,500 lines of Python, ~1,600 lines of XML (views, reports, security, data), 31 automated tests |
| **Production** | Docker Compose on a Linux VPS; two databases (live and staff training) |

---

## Tech stack

| Area | Technologies |
| --- | --- |
| **Languages** | Python 3, SQL (PostgreSQL), XML, QWeb (HTML/PDF templating), Bash |
| **Framework** | Odoo 19 ORM: models, computed and related fields, constraints, inheritance (`_inherit`), record rules, wizards (transient models), actions, the `mail.thread` / `mail.activity` mixins |
| **Odoo modules integrated** | Fleet, Accounting (`account`), `account_fleet`, Inventory (`stock`), Stock Valuation (`stock_account`), Sales, Mail/Activities, Odoo Mates accounting suite (`accounting_pdf_reports`, `om_fiscal_year`) |
| **Database** | PostgreSQL 15: raw SQL data backfills, `pg_dump`/`pg_restore` backup and recovery |
| **Reporting** | QWeb PDF reports (landscape statements, trip sheets, per-truck P&L), pivot and graph analytics, Excel export |
| **Testing** | Odoo test framework (`TransactionCase`, `AccountTestInvoicingCommon`), `freezegun` for time-dependent logic, `Form` UI simulation, permission tests with per-role test users |
| **Infrastructure** | Docker, Docker Compose, Docker secrets, Linux VPS, SSH |
| **Delivery** | Git, GitHub (private repo, read-only deploy keys), Bash deployment automation |
| **Tooling** | AI pair-programming (Claude Code) for implementation, review and documentation |

---

## Business problems solved and outcomes

| Business problem | Outcome |
| --- | --- |
| Fuel stations fill trucks on credit and also give drivers cash for the trip. These amounts were tracked outside the ledger and reconciled by hand. | Confirming a dispatch **posts the vendor bill in the same transaction**, so the payable is always in the books. Each station gets an **on-demand statement**: opening balance, every trip with truck and driver, payments, running balance. |
| Fuel stations have many branches, but the debt sits with the parent company. | Statements roll up to the **parent company**, the only level at which the balance is correct. Each line still shows the branch trip. |
| Management couldn't tell which trucks made or lost money. | A **Truck Ledger** shows income, expenses and **net profit per truck** for any period, read from posted accounting. It always agrees with the company P&L. |
| Third-party (hired) trucks blurred revenue figures. | A single generic **Hired Truck** separates own-fleet profit from subcontracted work. |
| Workshop spare parts were issued without being charged to a truck. | Parts issued on a maintenance job **move stock and post the valuation entry against the truck** automatically, at real stock cost. |
| Expensive parts (tyres, batteries) were replaced too often, with no oversight. | Flagged parts **can't leave the store until the MD approves**. Each request shows **how long ago and how many km ago** that truck last had a part of the same kind fitted, whether issued from the store or bought from a vendor. |
| Standard Fleet only knows cars and bikes. | **Truck** became a first-class vehicle type across forms, filters, driver changes and cost analysis. |
| Code changes reached production by hand. | A **one-command, safe deployment**: refuses uncommitted or unpushed code, backs up every database, upgrades, **verifies** the upgrade applied, and restarts only on success. |

---

## Solution 1: Fleet Dispatch (trip operations to accounts payable)

**What it does:** records each truck trip, including:
- truck, driver and route;
- diesel litres and price;
- the cash advance the fuel station gave the driver.

It runs a state machine: Draft → Dispatched → Returned → Done, with Cancel and Reset to Draft.

**Architecture and engineering decisions**
- **Accounting documents created in the same transaction as the business event.** Confirming a dispatch creates and posts a two-line vendor bill (fuel and cash advance), with expense accounts taken from the configured products. There is no purchase-order step, because the business doesn't buy fuel that way.
- **Least-privilege by design.** Bill creation runs with elevated rights inside a narrow, audited method. Fleet staff can therefore confirm trips without being given accounting access.
- **Data integrity guarantees:**
  - After confirmation, financially relevant fields are locked, so a dispatch always matches its posted bill.
  - Corrections go through cancel → reset → re-confirm.
  - Cancelling a paid dispatch is refused.
- **Respects closed accounting periods.** Cancelling inside a locked fiscal period issues a **credit-note reversal** dated today instead of changing history. Outside a locked period, the bill is cancelled.
- **Reuse over rebuild.** The vendor statement inherits the existing partner-ledger wizard and query helper from the accounting suite, so its filters behave exactly like the Partner Ledger accountants already know.
- **Extension points** (`_prepare_vendor_bill_vals`, `_prepare_bill_line_vals`, `_get_dispatch_products`) let future needs, such as toll charges, be added without changing core logic.
- **Multi-company** record rules and per-company configuration.

**Deliverables**
- Dispatch form with list, kanban, pivot and graph views.
- Printable trip sheet with signature blocks.
- Landscape **Fuel Vendor Statement** PDF, with an Excel-ready line view and trip totals per truck.
- Dispatch analytics.
- **Truck** vehicle type, wired into the standard driver-change workflow and cost reporting.

**Tests (13):**
- bill amounts and accounts;
- a company without a warehouse;
- field locking;
- cancellation in open, paid and locked periods;
- statement balances;
- PDF rendering;
- truck type behaviour.

---

## Solution 2: Truck Ledger (profit and loss per truck)

**What it does:** attributes every revenue and cost line to a truck, then reports income, expenses, net profit and margin per truck for any period.

**Architecture and engineering decisions**
- **Single source of truth: the general ledger.** The report doesn't keep parallel cost tables. It reads posted journal items tagged with a vehicle, using the vehicle dimension from `account_fleet`, so it **always reconciles with the P&L**.
- **The truck tag is captured at every point where money moves:**
  - sales order line → customer invoice;
  - dispatch fuel bills;
  - vendor bills;
  - stock valuation entries for issued parts;
  - manual journal entries.
- **Business rules enforced at the source.** A transportation sales order can't be confirmed, and a transportation invoice can't be posted, without a truck. Revenue is never left unattributed.
- **Workshop parts through real inventory valuation.** Issuing parts creates stock moves to a dedicated *Truck Maintenance* location. Under perpetual valuation, the cost lands on the truck's expense line at actual stock cost, so no figures are typed in by hand.
- **Safe migration of historical data.** A post-install hook backfills the truck onto **existing** dispatch bills and their reversals, using a set-based SQL `UPDATE` with `COALESCE` over the original entry. Past trips appear in the ledger from day one, and the ORM cache is then invalidated.
- **Noise control.** Fleet service logs that the standard module creates for fuel bills are suppressed, because fuel isn't maintenance.

**Deliverables**
- Truck Ledger wizard and landscape PDF: per-truck sections with a summary page.
- Pivot and list views for Excel export.
- Year-to-date Income / Expenses / Net buttons on each truck.
- Workshop **Spare Parts from Stock** with **Issue Parts**.

**Tests (9):**
- truck attribution from sales orders and invoices;
- enforcement rules;
- the historical backfill;
- parts valuation hitting the truck;
- ledger totals per truck.

---

## Solution 3: Spare Parts Approval (governance for high-value parts)

**Requirement:** some spare parts must not be issued without the Managing Director's approval. The MD must also see how long ago (and how far) that truck last had the same kind of part fitted.

**How I approached it**
- **Evaluated five options** and presented the trade-offs before building:
  - Odoo Approvals app (Enterprise-only, so unavailable);
  - activities only (not enforced);
  - line-level approval state;
  - a separate approval-request model;
  - Studio / automated rules (Enterprise, fragile).

  I recommended **line-level approval state** as the best balance of enforcement, fit with the existing design and build cost.
- **Surfaced the hidden requirements** before coding:
  - how to define "the same part" when tyres come in many brands and sizes;
  - whether tyre position matters;
  - self-approval;
  - what happens if a part is edited after approval.
- **Adapted to a mid-project requirement change.** The business then asked for history to include parts **bought directly from vendors**, not just parts issued from the warehouse. I extended the history search to merge two sources, store issues and posted vendor bills naming the truck, and pick the most recent. I redesigned the stored snapshot to record the source and a reference. The module wasn't yet in production, so I changed the fields freely instead of adding migration code.

**Architecture and engineering decisions**
- **Configuration over code:**
  - a *Requires MD Approval* flag on products;
  - a **Replacement Group** model (Tyre, Battery, …), so any tyre counts as a replacement of any other tyre on that truck.
- **Enforcement in the domain layer, not just the UI:**
  - **Issue Parts** releases approved and non-controlled parts and holds the rest.
  - Only the approver security group can write a decision, even through imports or the API.
  - Nobody can approve their own request.
  - Changing a part or quantity after a decision automatically re-opens it.
- **Open/closed principle.** I added a small `_filter_issuable()` hook to the existing ledger module. The new module plugs its rules into it, so the original issuing code stays untouched.
- **Point-in-time snapshot.** History (date, part, source, reference, distance) is saved when approval is requested, so the MD's decision is auditable against what was known at that moment.
- **Workflow and notifications** through Odoo's activity system: each approver gets a to-do and an email. A dedicated **Parts Approvals** dashboard supports approving or rejecting many lines at once, and rejections require a reason.
- **Human-readable intervals** ("1 year 3 months ago") computed with `relativedelta`. Distance comes from odometer readings.

**Tests (9):**
- blocking and partial issue;
- the permission model;
- self-approval prevention;
- reject → edit → resubmit;
- re-approval after changes;
- replacement-group matching across products;
- vendor-bill history versus store history (newest wins; other trucks and draft bills ignored);
- interval wording.

Time-dependent scenarios use frozen clocks.

---

## Solution 4: Release engineering and operations

**Setup**
- The custom code lives in its own private GitHub repository. I separated it from the Odoo source fork to keep upgrades clean.
- The production server pulls with a **read-only deploy key**.
- Odoo and PostgreSQL run in **Docker Compose**, with the database password supplied as a **Docker secret**.

**`deploy.sh`**, a one-command release script. It:
1. refuses to deploy uncommitted or unpushed code, so production always matches a commit on GitHub;
2. **backs up every database** before touching it, keeping the last 10 per database;
3. pulls (fast-forward only), then installs or upgrades the named modules in each database;
4. **verifies the result rather than trusting exit codes:**
   - no errors in the log;
   - the registry loaded;
   - each module's installed version matches its manifest;
5. restarts the application only if every check passes. On failure it prints the relevant log lines and the backup to restore from.

**Robustness details I fixed along the way:**
- remote `docker compose exec` consuming the piped script;
- shell quoting of arguments over SSH;
- container file permissions for secrets.

**Practices**
- A separate **training database** with the same code, for staff onboarding and rehearsals.
- A **local test database**.
- A documented backup **restore procedure**.

---

## Senior architect competencies demonstrated

- **Requirements to architecture:**
  - turned informal business needs (e.g. "the MD should see when the tyre was last changed") into precise data models and rules;
  - flagged ambiguous requirements and asked the business to decide them before building.
- **Trade-off analysis:**
  - compared build options on enforcement, licence constraints (Community vs Enterprise), cost and maintainability;
  - recommended one option and explained why.
- **Domain-driven design on an ERP:**
  - modelled the business's real concepts (dispatch, replacement group, hired truck, parent-company statement) instead of forcing the business into generic screens.
- **Financial correctness:**
  - double-entry consequences of every operation;
  - respect for locked periods (reversal entries);
  - perpetual inventory valuation;
  - reconciliation with the P&L by design (one source of truth).
- **Extend, don't fork:**
  - all behaviour added through inheritance and hooks;
  - zero changes to Odoo core;
  - small, named extension points for future requirements.
- **Security by design:**
  - role-based access groups and record rules;
  - multi-company isolation;
  - narrowly scoped privilege elevation;
  - server-side enforcement that the UI can't bypass.
- **Data migration:** idempotent, set-based SQL backfills so historical data fits new reporting.
- **Quality engineering:**
  - 31 automated tests covering business rules, permissions, accounting outcomes and edge cases;
  - deterministic time-based tests.
- **Operational excellence:**
  - automated, verified, backup-first deployments;
  - separate training environment;
  - documented recovery.
- **Change management:**
  - absorbed a requirement change mid-delivery;
  - kept the full test suite green.
- **Documentation:** user and technical guides per module (setup, workflow, accounting effects, security, extension points, test coverage).

---

## Résumé bullets (ready to use)

- Architected and delivered a custom **Odoo 19 (Python/PostgreSQL)** fleet-and-finance platform for a haulage company: dispatch operations, fuel-vendor accounting, per-truck profitability and governed spare-part issuance. Sole engineer from requirements to production.
- Automated **accounts-payable creation for fuel purchases and driver cash advances** at dispatch time. Built a **parent-company vendor statement** with running balances and trip-level detail, replacing manual reconciliation with fuel stations.
- Built a **per-truck P&L ledger** that reads directly from the general ledger, so it always reconciles with company accounts. Truck attribution is enforced on sales, invoices, vendor bills and inventory valuation, with a **SQL backfill** that brought historical trips into the report.
- Designed a **management approval workflow** for high-value spare parts:
  - role-based enforcement;
  - self-approval prevention;
  - automatic re-approval on change;
  - replacement history from **both warehouse issues and vendor purchases** ("last tyre change: 9 months / 42,000 km ago").
- Built a **verified, backup-first deployment pipeline** (Git, GitHub deploy keys, Docker Compose, Bash): every release backs up all databases, upgrades, checks the installed versions against the code, and restarts only on success.
- Wrote **31 automated tests** covering accounting outcomes, locked-period reversals, permissions and time-dependent logic, plus user and technical documentation for each module.

---

## Short portfolio blurb

> **Fleet and Finance Platform on Odoo 19.** I designed and built custom ERP modules for a trucking company. Each trip posts its fuel bill automatically. Every revenue and cost line is tagged to a truck, giving a per-truck P&L that always matches the books. High-value spare parts need the MD's approval, and the request shows when that truck last had the same part replaced, whether from the store or a vendor. Stack: Python, Odoo ORM, PostgreSQL, QWeb PDF reporting, Docker Compose, Git and GitHub, with automated, verified deployments and 31 automated tests.
