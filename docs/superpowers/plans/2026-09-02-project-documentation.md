# Rakusai Project Documentation Implementation Plan

> **For agentic workers:** Execute each checkbox in order. Preserve the source precedence and do not infer missing contracts.

**Goal:** Produce nine mutually consistent project documents from the four existing Rakusai requirement sources.

**Architecture:** Use `Rakusai-System-Database-Design.md` as the primary source, `RULE.md` as a non-conflicting rule/test supplement, and the two Draw.io files as verification sources. Separate business scope, architecture, API contract, persistence contract, conventions, decisions, delivery tracking, and issue tracking so each concern has one authoritative document.

**Tech Stack:** Markdown, Mermaid, Next.js App Router, Tailwind CSS, TanStack React Query, Zustand, NestJS DDD, Prisma, PostgreSQL, Redis, BullMQ, Docker Compose, AWS.

## Global Constraints

- `Rakusai-System-Database-Design.md` has precedence over all other current sources.
- Preserve mobile-first AM/SM/Sub-SM operation and RikuOp integration from the primary source.
- Do not introduce mock frontend data or query-parameter state simulation.
- Do not add fields, endpoints, states, decisions, or resolved values that the sources do not define.
- Preserve Asia/Tokyo business time and UTC persistence.
- Keep open items explicitly unresolved.
- Do not modify the four requirement source files.

---

### Task 1: Establish AI and source-governance rules

**Files:**

- Create: `CLAUDE.md`
- Create: `DECISIONS.md`

**Produces:** Source precedence, AI operating rules, and a decision register grounded in the current requirements.

- [x] Write the source hierarchy and non-assumption rules in `CLAUDE.md`.
- [x] Record confirmed architecture, security, data, concurrency, notification, UI, and deployment decisions in `DECISIONS.md`.
- [x] Verify that every decision cites a current source and no open item is marked accepted.

### Task 2: Consolidate functional scope and architecture

**Files:**

- Create: `PROJECT-DETAIL.md`
- Create: `ARCHITECTURE.md`

**Consumes:** Actors, module map, state machines, queue flows, deployment topology, and non-functional requirements.

**Produces:** A functional reference and a renderable architecture reference.

- [x] Document goals, actors, permissions, functional modules, workflows, state machines, notifications, scope exclusions, and open items.
- [x] Document the four-layer architecture, bounded contexts, synchronous and asynchronous flows, deployment topology, security, observability, and concurrency.
- [x] Add Mermaid diagrams using only modules and flows present in the sources.
- [x] Cross-check mobile and RikuOp content against the primary source.

### Task 3: Define FE/BE and persistence contracts

**Files:**

- Create: `API-CONTRACT.md`
- Create: `DATABASE-SCHEMA.md`

**Consumes:** API conventions, representative endpoints, table definitions, ERD, state machines, and concurrency rules.

**Produces:** A contract boundary for FE/BE and a database/ERD reference.

- [x] Define response/error envelopes only at the property level established by the source.
- [x] Separate FE obligations, BE obligations, query parameters, endpoint purpose, authorization, and known persistence mapping.
- [x] Label representative endpoints as illustrative and identify contracts not supplied by the sources.
- [x] Transcribe all 19 table definitions, nullability, keys, enums, constraints, and relationships.
- [x] Add an ERD Mermaid diagram and validate entity names against the Draw.io ERD.

### Task 4: Define coding rules and phased delivery tracking

**Files:**

- Create: `CODING-CONVENTIONS.md`
- Create: `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`

**Consumes:** Stack choices, DDD boundaries, validation/security rules, queue behavior, state machines, and known open items.

**Produces:** Implementation guardrails and a dependency-ordered backlog with evidence-based status.

- [x] Write conventions for naming, module ownership, FE state, API DTOs, Prisma/transactions, queues, security, logging, audit, timezone, tests, and documentation sync.
- [x] Split delivery into foundation, identity/master data, recruitment approval, candidate engagement, scheduling, notifications/integration, and hardening/release phases.
- [x] Give each task a stable ID, source reference, dependency, deliverable, acceptance criteria, and initial status.
- [x] State that documentation exists but application implementation is not evidenced in the repository.

### Task 5: Create issue and gap tracking

**Files:**

- Create: `ISSUES-LIST-TRACKING.md`

**Consumes:** Source conflicts, Section 8 open items, `RULE.md` edge cases, and model mismatches discovered during cross-checking.

**Produces:** A non-speculative register of source conflicts, unresolved requirements, and implementation risks.

- [x] Record PC/mobile and RikuOp source conflicts as resolved-by-precedence documentation issues.
- [x] Record all open items from the primary source as open.
- [x] Record only evidenced schema/state/flow mismatches and explicit security/concurrency risks.
- [x] Do not report runtime bugs without application code or execution evidence.

### Task 6: Cross-document verification

**Files:**

- Verify all nine root Markdown deliverables.

**Produces:** A consistent documentation set ready for engineering use.

- [x] Check that all requested files exist and are valid UTF-8 Markdown.
- [x] Search for prohibited assumptions, unresolved placeholder language, PC-only assertions, and RikuOp exclusion assertions.
- [x] Compare table and field names between `API-CONTRACT.md` and `DATABASE-SCHEMA.md`.
- [x] Compare state names between `PROJECT-DETAIL.md`, `API-CONTRACT.md`, and `DATABASE-SCHEMA.md`.
- [x] Verify all 19 source tables and 12 representative endpoints are covered.
- [x] Report remaining source-defined open items and known conflicts without silently resolving them.

