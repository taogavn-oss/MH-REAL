**RAKUSAI**

Recruitment Management System

**System & Database Design Document**

Client: MH Holdings

Prepared by: Hoang Dung

Version 1.0 \| August 2026 \| DYM IT project

Detail resource drive:

[<u>Rakusai technical stuffs</u>](https://drive.google.com/drive/folders/1H1QTjQfIobqmgJjpuXDn8-Y3aSAHJ4qB?usp=sharing)

Ref documentation:

[<u>要件定義書_MHホールディングス_rakusai</u>](https://docs.google.com/document/d/1QQRGoDW84KgEo65tU4_afrk8ItxUnIlzc6ds31F8yqI/edit?tab=t.wzncs0m7yukc)

# **Table of Contents**

[**Table of Contents 2**](#table-of-contents)

[**1. Introduction 4**](#introduction)

> [1.1 Purpose of this Document 4](#purpose-of-this-document)
>
> [1.2 Business Background & Goals 4](#business-background-goals)
>
> [1.3 Scope 4](#scope)
>
> [1.4 Source Documents 4](#source-documents)

[**2. Architecture Overview 5**](#architecture-overview)

> [2.1 Technology Stack 5](#technology-stack)
>
> [Frontend 5](#frontend)
>
> [Backend 5](#backend)
>
> [2.2 High-Level Architecture 5](#high-level-architecture)
>
> [2.3 Bounded Contexts (DDD Module Map) 6](#bounded-contexts-ddd-module-map)
>
> [2.4 Deployment Topology 6](#deployment-topology)

[**3. Domain Model & Business Rules 8**](#domain-model-business-rules)

> [3.1 Actors & Permission Matrix 8](#actors-permission-matrix)
>
> [3.2 Organizational Data Relationships 8](#organizational-data-relationships)
>
> [3.3 Job Requirement Approval State Machine 8](#job-requirement-approval-state-machine)
>
> [3.4 Candidate Flow State Machine 8](#candidate-flow-state-machine)
>
> [3.5 Scheduling Concurrency Rules 9](#scheduling-concurrency-rules)
>
> [3.6 Notification & Reminder Rules 9](#notification-reminder-rules)

[**4. System Design - Core Modules 10**](#system-design---core-modules)

> [4.1 Identity, Access & Audit Module 10](#identity-access-audit-module)
>
> [4.2 Master Data Import/Export Module 10](#master-data-importexport-module)
>
> [4.3 Recruitment Requirement Module 10](#recruitment-requirement-module)
>
> [4.4 Scheduling Module 10](#scheduling-module)
>
> [4.5 Candidate Engagement Module 10](#candidate-engagement-module)
>
> [4.6 Notification / Webhook Service 11](#notification-webhook-service)
>
> [4.7 RikuOp Integration Module 11](#rikuop-integration-module)
>
> [4.8 Notification of Requirement Workflow Events 11](#notification-of-requirement-workflow-events)

[**5. API Design Guidelines 12**](#api-design-guidelines)

> [5.1 Conventions 12](#conventions)
>
> [5.2 Representative Endpoints 12](#representative-endpoints)

[**6. Database Design 13**](#database-design)

> [6.1 Design Principles 13](#design-principles)
>
> [6.2 Entity Overview 13](#entity-overview)
>
> [6.3 Table Definitions 13](#table-definitions)
>
> [6.4 Concurrency Control 20](#concurrency-control)
>
> [6.5 Database visualization 21](#database-visualization)
>
> [6.6 Queue flows visualization 22](#queue-flows-visualization)

[**7. Non-Functional Requirements & Design Solutions 23**](#non-functional-requirements-design-solutions)

> [7.1 Security 23](#security)
>
> [7.2 Operability 24](#operability)
>
> [7.3 Concurrency Control 24](#concurrency-control-1)
>
> [7.4 Notification Reliability 24](#notification-reliability)
>
> [7.5 External Integration Resilience 24](#external-integration-resilience)
>
> [7.6 Scalability & Extensibility 24](#scalability-extensibility)
>
> [7.7 Observability 24](#observability)

[**8. Open Items Carried From the Requirement Document 25**](#open-items-carried-from-the-requirement-document)

> [To confirm during design 25](#to-confirm-during-design)
>
> [To confirm before implementation begins 25](#to-confirm-before-implementation-begins)
>
> [To confirm before release 25](#to-confirm-before-release)

[**9. Appendix 26**](#appendix)

> [9.1 Glossary 26](#glossary)
>
> [9.2 Out of Scope (Confirmed) – for later (?) 26](#out-of-scope-confirmed-for-later)

# **1. Introduction**

## **1.1 Purpose of this Document**

This document defines the system architecture and database design for the Rakusai recruitment management platform, a full rebuild commissioned by MH Holdings. It translates the business requirement definition (要件定義書) and the technical summary produced during discovery into a concrete, implementable technical blueprint: module boundaries, domain and data models, state machines, API conventions, and non-functional design decisions. It is intended for the engineering team as the primary reference during implementation, and for the client as a technical validation of how each business requirement will be realized.

A central design principle throughout this document is flexibility: MH Holdings' operational rules (approval steps, survey question sets, reminder cadences, import formats) are still evolving, and several items are explicitly listed as pending confirmation in the requirement document. The architecture and schema below are built so that these areas can change with configuration or additive migrations rather than structural rewrites.

## **1.2 Business Background & Goals**

MH Holdings currently manages recruitment operations through a combination of a legacy web system and manual Google Sheets tracking. This creates data fragmentation, forces store staff to depend on PCs for tasks that happen on the shop floor, and provides no per-user accountability. The rebuild is driven by four goals:

- Kill the Spreadsheet - consolidate all job requirement setup and interview scheduling into a single source of truth.

- Mobile-first operation - Store Managers (SM) and Area Managers (AM) must be able to perform all daily operations from a smartphone.

- Individual identity & access control - every user has a personal account, enabling RBAC and a full audit trail instead of shared logins.

- End-to-end automation of the candidate pipeline - deep integration with RikuOp so that candidate intake, survey dispatch, scheduling confirmation, and reminders require minimal manual intervention.

## **1.3 Scope**

In scope:

- Full rebuild of the Rakusai recruitment system (new codebase, not a migration of the legacy system).

- Integration with RikuOp for candidate intake and status synchronization (subject to RikuOp's sign-off on the integration specification prior to release).

- Master data management for Area / Store / SM / Sub-SM / AM via import/export.

- Job requirement authoring and approval workflow, interview slot scheduling, candidate survey webview, blacklist management, and internal/candidate notifications.

Out of scope (see Section 9 for the complete list carried over from the requirement document):

- Migration of historical data from the legacy system (both systems run in parallel until existing candidates finish processing).

- IP-based access restriction, candidate account/login, automatic monthly reset of approval status.

## **1.4 Source Documents**

- 要件定義書_MHホールディングス_rakusai (Business Requirement Definition)

- Summary RAKUSAI project - Technical View

- Prompt - New Project (technology stack & engineering conventions)

# **2. Architecture Overview**

## **2.1 Technology Stack**

### **Frontend**

| **Concern**        | **Choice**                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------|
| Framework          | Next.js (App Router), latest stable v16+                                                                              |
| Styling            | Tailwind CSS with a shared design-token config (primary / secondary / semantic color scales, reusable class variants) |
| Server state       | TanStack React Query (latest stable)                                                                                  |
| Client state       | Zustand, used selectively to avoid unnecessary re-renders                                                             |
| UI components      | shadcn/ui, react-day-picker, lucide-react icons                                                                       |
| Date/time          | date-fns + date-fns-tz (Asia/Tokyo as the default business timezone)                                                  |
| Forms & validation | react-hook-form + zod schemas shared between form and API contract                                                    |
| Notifications / UX | react-toastify, motion (for lightweight, purposeful animation)                                                        |
| Utilities          | lodash, used for hot-path data transforms                                                                             |

### **Backend**

| **Concern**     | **Choice**                                                                                                                                                                               |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Framework       | NestJS, latest stable, structured with Domain-Driven Design                                                                                                                              |
| Database        | PostgreSQL, accessed through Prisma (@prisma/client)                                                                                                                                     |
| Validation      | class-validator / class-transformer at the DTO boundary                                                                                                                                  |
| Date/time       | date-fns + date-fns-tz, all business logic normalized to Asia/Tokyo, persisted in UTC                                                                                                    |
| AuthZ           | RBAC via a custom Roles decorator + guard, composable with resource-scope guards                                                                                                         |
| Audit           | Global interceptor capturing all mutating requests (GET excluded to avoid noise from FE re-render polling)                                                                               |
| Background jobs | Redis + BullMQ for queues (notification dispatch, RikuOp sync, no-response auto-decline, reminders)                                                                                      |
| Cross-cutting   | Swagger/OpenAPI, helmet, hpp, cookie-parser, sanitizer, express-rate-limit, compression, structured logger, versioned API (/api/v{n}), ResponseTransformInterceptor, HttpExceptionFilter |
| Environments    | Docker Compose for local/staging; environment-driven config abstraction so production can swap to AWS-managed services without code changes                                              |

## **2.2 High-Level Architecture**

The system is organized as four logical layers. Each layer only depends on the layer(s) below it, which keeps the domain logic independent of delivery mechanism (HTTP, queue consumer, cron) and of specific infrastructure providers.

| **Layer**         | **Responsibility**                                                            | **Representative Components**                                                             |
|-------------------|-------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Presentation      | Web & mobile-web UI, candidate webview (no install, no account)               | Next.js app router pages, shared component library, PWA-friendly layout for SM/AM         |
| Application (API) | Use-case orchestration, DTO validation, authorization, transaction boundaries | NestJS controllers, application services, guards, interceptors                            |
| Domain            | Business rules and invariants, independent of frameworks                      | Aggregates (JobRequirement, InterviewSlot, Candidate...), domain services, state machines |
| Infrastructure    | Persistence, messaging, external integration, notification delivery           | Prisma/PostgreSQL repositories, Redis/BullMQ, RikuOp adapter, SMS/Email provider adapter  |

**Logical request/data flow:**

| **Step** | **Flow**                                                                               |
|----------|----------------------------------------------------------------------------------------|
| 1        | RikuOp → Integration Adapter → Application Service                                     |
| 2        | Application Service → Domain (validate / dedupe / blacklist) → Repository (PostgreSQL) |
| 3        | Domain event → Notification Queue (Redis/BullMQ) → SMS/Email Provider → Candidate      |
| 4        | Status/schedule change → Outbound sync back to RikuOp (logged in rikuop_sync_logs)     |

## **2.3 Bounded Contexts (DDD Module Map)**

The backend is decomposed into bounded contexts that map directly to NestJS modules. Each module owns its aggregates, exposes application services, and communicates with other modules through explicit interfaces (application services or domain events) rather than shared database access - this keeps modules independently testable and lets new requirements be added inside a single context without rippling changes elsewhere.

| **Bounded Context**     | **Owns**                                                   | **Key Responsibilities**                                                  |
|-------------------------|------------------------------------------------------------|---------------------------------------------------------------------------|
| Identity & Access       | User, Role, Session, AuditLog                              | Authentication, **RBAC**, password lifecycle, audit trail                 |
| Master Data             | Area, Store, StoreManagerAssignment, AreaManagerAssignment | Org hierarchy, import/export, account provisioning on import              |
| Recruitment Requirement | JobRequirement, JobRequirementVersion, ApprovalAction      | Requirement authoring, versioning, approval state machine                 |
| Scheduling              | InterviewSlot, InterviewSchedule                           | Slot management, conflict detection, booking, rescheduling/cancellation   |
| Candidate Engagement    | Candidate, SurveyToken, SurveyResponse, BlacklistEntry     | Intake, deduplication, blacklist check, survey webview, screening outcome |
| Notification            | Notification (scheduled/sent/failed)                       | Templated SMS/Email dispatch with delivery guarantees                     |
| RikuOp Integration      | RikuopSyncLog, adapter/anti-corruption layer               | Inbound candidate intake, outbound status sync, spec-drift detection      |

## **2.4 Deployment Topology**

| **Environment**  | **Compute**                                        | **Database**                         | **Cache/Queue**              | **Notes**                                                                                       |
|------------------|----------------------------------------------------|--------------------------------------|------------------------------|-------------------------------------------------------------------------------------------------|
| Local            | Docker Compose (API, Web)                          | PostgreSQL container                 | Redis container              | Seed scripts for roles, sample master data                                                      |
| Staging          | Docker Compose or single ECS service               | PostgreSQL container / small RDS     | Redis container              | Mirrors production config via environment variables                                             |
| Production (AWS) | ECS Fargate (API), Vercel or CloudFront + S3 (Web) | Amazon RDS for PostgreSQL (Multi-AZ) | Amazon ElastiCache for Redis | Secrets in AWS Secrets Manager; SES/SNS or a transactional provider (e.g. Twilio) for Email/SMS |

*Note: All infrastructure connections (DB, Redis, SMS/Email provider, RikuOp endpoint) are resolved through a single ConfigService reading environment variables. No environment-specific branching exists in application code - moving from Docker-hosted services to AWS-managed equivalents at go-live requires configuration changes only.*

# **3. Domain Model & Business Rules**

## **3.1 Actors & Permission Matrix**

| **Actor**                     | **Login**                                     | **Data Scope**                                                          | **Core Permissions**                                                                                                                                      |
|-------------------------------|-----------------------------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| HQ (Head Quarter)             | ID/password (PC)                              | All stores, all candidates                                              | Confirm/edit/export requirements for all stores, manage schedules for all stores, register/assign candidates, manage blacklist, import/export master data |
| AM (Area Manager)             | ID/password (Smartphone, PC layout available) | Stores in assigned area(s); for directly-owned stores, same scope as SM | Approve/reject job requirements in own area; for own store, author requirements exactly like an SM (self-approves)                                        |
| SM (Store Manager)            | ID/password (Smartphone, PC layout available) | Own store only                                                          | Author/edit/submit job requirements, open interview slots, adjust interview schedule at own store                                                         |
| Sub-SM (Deputy Store Manager) | ID/password (Smartphone, PC layout available) | Own store only                                                          | Identical permissions to SM; edits the same shared store requirement record                                                                               |
| Candidate (Applicant)         | No account - dedicated URL only               | Own survey/result/reminder screens                                      | Submit survey, view result, view reminder                                                                                                                 |

## **3.2 Organizational Data Relationships**

- AM : Area = 1 : N - one AM can be responsible for multiple areas.

- Area : Store = 1 : N - one area contains multiple stores.

- Store : SM = N : N - a store has multiple managers (exactly one designated as primary SM, the rest as Sub-SM), and one manager can be responsible for multiple stores.

*Note: Block, prefecture, and legal-representative fields are pending confirmation from the client's master-data template (see Section 9). They are included in the schema as nullable columns so onboarding is not blocked.*

## **3.3 Job Requirement Approval State Machine**

Every store has at most one job requirement per channel (Web, Other Media). Editing an already-approved requirement resets it to Draft, so the current published content and the pending edit are always distinguishable via versioning (Section 6).

| **State**         | **Meaning**                                            | **Allowed Transition(s)**                                          |
|-------------------|--------------------------------------------------------|--------------------------------------------------------------------|
| Draft             | Being edited by SM/Sub-SM, not yet submitted           | → Pending AM Review (submit)                                       |
| Pending AM Review | Awaiting the area's AM                                 | → Approved by AM (approve) · → Rejected (reject, comment required) |
| Approved by AM    | AM has approved; auto-forwarded to HQ                  | → Pending HQ Review                                                |
| Pending HQ Review | Awaiting HQ confirmation                               | → Approved by HQ (approve) · → Rejected (reject)                   |
| Approved by HQ    | Published, visible to candidates via the survey screen | → Draft (any subsequent edit)                                      |
| Rejected          | Returned to the submitter with a mandatory comment     | → Draft (edit and resubmit)                                        |

Special case: when an AM submits the requirement for a store they personally manage, the AM's own submission is auto-approved at the AM step (self-approval), and the record proceeds directly to Pending HQ Review.

## **3.4 Candidate Flow State Machine**

| **Status**                  | **Description**                                                     | **Entered Via**                                               |
|-----------------------------|---------------------------------------------------------------------|---------------------------------------------------------------|
| Received                    | Candidate ingested from RikuOp; duplicate/blacklist check performed | RikuOp webhook / HQ manual registration                       |
| Survey Sent                 | Survey link dispatched by SMS/Email                                 | Automated, immediately after screening                        |
| Survey Completed            | Candidate submitted the survey form                                 | Candidate webview submission                                  |
| No Response                 | 5 days elapsed with no survey submission                            | Scheduled job (auto-decline), syncs status back to RikuOp     |
| Passed / Failed             | Screening outcome communicated to candidate                         | SM/HQ decision or automated matching outcome                  |
| Interview Scheduled         | Slot booked; location/URL and reminder pending                      | Automatic slot match or manual assignment by SM/HQ            |
| Interview Adjustment Needed | No matching slot; requires manual coordination                      | System fallback when survey preferences do not fit open slots |
| Completed / Cancelled       | Terminal state                                                      | Interview outcome or explicit cancellation                    |

## **3.5 Scheduling Concurrency Rules**

Interview slots are tied to the responsible SM, not to a single store, because one SM can manage multiple stores. This creates three concurrency scenarios that the design must explicitly protect against (see Section 6.4 for the technical mechanism):

- SM and Sub-SM editing the same store's job requirement simultaneously.

- HQ and SM operating on the same interview slot at the same time.

- The same SM's time slot being booked concurrently from two different stores they manage - the slot must appear "full" in the second store the instant it is booked in the first.

## **3.6 Notification & Reminder Rules**

| **Event**                                                  | **Recipient** | **Channel** | **Timing**                                           |
|------------------------------------------------------------|---------------|-------------|------------------------------------------------------|
| SM submits job requirement                                 | AM            | Email       | Immediate                                            |
| AM rejects job requirement                                 | SM, Sub-SM    | Email       | Immediate, includes rejection comment                |
| AM approves job requirement                                | HQ            | Email       | Immediate                                            |
| Approval reminder                                          | AM            | Email       | 3 days after submission, then daily until acted on   |
| Edit reminder                                              | SM            | Email       | 3 days after rejection, then daily until resubmitted |
| Candidate survey / result / schedule change / cancellation | Candidate     | SMS/Email   | Immediate, per event                                 |
| Interview reminder                                         | Candidate     | SMS/Email   | 1 day before the interview                           |

*Note: Send-volume caps, exact send-time windows, and holiday handling for reminders are still pending confirmation (Section 9, item 10-7). The Notification module treats these as configuration rather than code, so they can be tuned without a deployment once finalized.*

# **4. System Design - Core Modules**

## **4.1 Identity, Access & Audit Module**

- Authentication: ID/password login for HQ/AM/SM/Sub-SM; passwords stored with a salted hash (bcrypt/argon2), never plain text. Accounts are provisioned automatically during master-data import and users are notified by email.

- Authorization: a custom @Roles(...) decorator combined with a RolesGuard enforces role-level access; a second ScopeGuard enforces data-scope rules (store/area ownership) so that, for example, an SM's requests are always filtered to their own store at the query layer, not only hidden in the UI.

- Audit logging: a global ActivityLoggingInterceptor captures actor, action, entity, before/after payload for all mutating requests (POST/PUT/PATCH/DELETE). GET requests are excluded to avoid log noise from frontend re-render polling, per the client's explicit requirement.

- Candidates never authenticate; every candidate-facing screen is reached exclusively through a signed, time-limited magic-link token (Section 4.5).

## **4.2 Master Data Import/Export Module**

- Bulk import/export of Area / Store / SM / Sub-SM / AM links, and export of current settings, scoped to HQ.

- Import creates new user accounts for previously unknown SM/Sub-SM/AM automatically.

- Each import run is recorded (Section 6, master_data_import_logs) with per-row success/failure detail so partial failures are diagnosable without re-running the whole file.

- The exact column layout for the import template is still pending the client's data sample (Section 9, item 10-5/10-6); the importer is built around a mapping-configuration layer so the expected column set can be adjusted without touching the ingestion pipeline.

## **4.3 Recruitment Requirement Module**

- Implements the state machine in Section 3.3. Each edit creates a new JobRequirementVersion rather than mutating the record in place, so the currently published version and an in-progress draft can coexist.

- Requirement content itself (desired experience, wage, working hours, dress code, items to bring, event-work flag, etc.) is stored as a structured JSONB payload rather than one column per field. This is a deliberate extensibility choice: the client's survey/requirement field set is expected to evolve, and JSONB lets new fields be introduced by the application layer without a schema migration, while still allowing indexed queries on the fields that matter operationally (store, channel, status).

- Approval actions (submit/approve/reject with optional comment) are appended to an immutable approval_actions log, giving HQ and AM full traceability per version.

## **4.4 Scheduling Module**

- Interview slots belong to an SM (sm_user_id), not directly to a store, matching the business rule that a slot booked at one store makes the SM unavailable at every other store they manage.

- A unique constraint on (sm_user_id, slot_date, start_time) prevents the same SM from having two open/booked slots at the same time across different stores, which structurally enforces the cross-store conflict rule from Section 3.5.

- Booking a slot is a single transaction that (a) locks the slot row, (b) verifies status = open, (c) creates the InterviewSchedule, and (d) flips the slot to booked - see Section 6.4 for the concurrency mechanism.

- HQ can add slots on behalf of a store, explicitly selecting which SM the slot is attributed to when a store has more than one manager (open item 10-2).

## **4.5 Candidate Engagement Module**

- Candidate intake normalizes RikuOp payloads, checks the blacklist (phone/email match) and duplicate detection, and only then proceeds to survey dispatch - never account creation.

- The survey/result/reminder screens are reached via a single-use or short-lived signed token (candidate_survey_tokens), delivered as a magic link over SMS/Email. The token is opaque and stored hashed; expiry and single-use behavior are enforced server-side.

- Business rules enforced at the API layer, independent of the FE: interview slots within the next 36 hours are hidden from candidates; stores without a published requirement show a "form is being prepared" message; stores in a stopping/closing state show a pause notice; stores that disallow car commuting surface that notice; and unmatched preferences route the candidate to a manual "schedule adjustment" flow instead of a dead end.

- Survey answers are stored as a structured JSONB response (Section 6) for the same extensibility reason as job requirements - this form is expected to change as the client refines what they ask candidates.

## **4.6 Notification / Webhook Service**

- All outbound SMS/Email is enqueued as a Notification record with status = scheduled and a deterministic idempotency_key (e.g. hash of event type + entity id + template), then a BullMQ worker performs the actual send and transitions the record to sent or failed with retry/back-off.

- The idempotency key guarantees the same event cannot produce two duplicate messages even if the triggering job is retried or a webhook is redelivered by RikuOp - this directly satisfies the requirement's "no missed recipients, no duplicate sends" rule.

- Failed sends after exhausting retries move to a dead-letter state visible to HQ, rather than silently disappearing.

## **4.7 RikuOp Integration Module**

- Implemented as an anti-corruption layer: a dedicated adapter translates between RikuOp's payload shape and the internal Candidate/JobRequirement domain model, so a RikuOp contract change is isolated to the adapter rather than spreading through the domain.

- Inbound: RikuOp candidate intake via webhook (or polling, depending on RikuOp's finalized integration contract), landing in the Candidate Engagement module described above.

- Outbound: status changes, memo updates, and interview set/change/cancel actions are pushed back to RikuOp; every call and its outcome is recorded in rikuop_sync_logs, satisfying the requirement to record integration failures for later confirmation.

- A lightweight contract check runs against RikuOp's response shape on each call; unexpected shape changes are logged as a distinct failure reason so a RikuOp-side spec change is detectable rather than surfacing as a generic error.

## **4.8 Notification of Requirement Workflow Events**

Internal notifications (Section 3.6) reuse the same Notification module and delivery guarantees as candidate-facing messages, keeping a single reliable dispatch mechanism for the whole system rather than a parallel ad-hoc email sender.

# **5. API Design Guidelines**

## **5.1 Conventions**

- All endpoints are versioned and prefixed: /api/v1/..., enabled via Nest's setGlobalPrefix + enableVersioning.

- Every response is normalized by a global ResponseTransformInterceptor into a consistent envelope (success flag, data, meta, error), so FE data-fetching code does not special-case endpoints.

- Errors are normalized by a global HttpExceptionFilter into a consistent error shape (code, message, details) for predictable handling in TanStack Query.

- List endpoints share a common pagination and filter contract (page, pageSize, sort, and per-resource filter fields), matching the filter requirements called out per screen in the requirement document (store name, publish status, approval status, block, area, prefecture, etc.).

- All input validation happens server-side via class-validator DTOs regardless of what the frontend already validates with zod, per the requirement's explicit security rule.

## **5.2 Representative Endpoints**

| **Module**         | **Endpoint (illustrative)**                   | **Purpose**                                               |
|--------------------|-----------------------------------------------|-----------------------------------------------------------|
| Auth               | POST /api/v1/auth/login                       | ID/password login, issues session/JWT                     |
| Job Requirement    | GET /api/v1/job-requirements?storeId=&status= | List/filter requirements (scope enforced by role)         |
| Job Requirement    | POST /api/v1/job-requirements/:id/submit      | Submit current draft version for approval                 |
| Job Requirement    | POST /api/v1/job-requirements/:id/approve     | AM/HQ approval step                                       |
| Job Requirement    | POST /api/v1/job-requirements/:id/reject      | Reject with mandatory comment                             |
| Scheduling         | GET /api/v1/stores/:storeId/slots?date=       | List open/booked slots for a store                        |
| Scheduling         | POST /api/v1/slots/:id/book                   | Book a candidate into a slot (optimistic-locked)          |
| Candidate (public) | GET /api/v1/public/survey/:token              | Resolve a magic-link token to the survey form             |
| Candidate (public) | POST /api/v1/public/survey/:token             | Submit survey answers                                     |
| Master Data        | POST /api/v1/master-data/import               | Bulk import Area/Store/SM/Sub-SM/AM                       |
| Integration        | POST /api/v1/integrations/rikuop/candidates   | Inbound webhook from RikuOp                               |
| System             | GET /api/v1/health                            | Liveness/readiness - checks DB, Redis, dependent services |

# **6. Database Design**

## **6.1 Design Principles**

- Every table carries created_by, updated_by, created_at, updated_at - an explicit requirement from the non-functional requirements section, and the foundation for the audit trail.

- Surrogate UUID primary keys throughout, so records can be created client-side/offline-safely and merged without ID collisions, and so IDs never leak sequential business volume.

- Structured-but-evolving content (job requirement details, survey answers, notification payloads, location info) is stored as JSONB rather than being fully normalized into columns, trading some query ergonomics for the ability to add fields the client requests later without a migration. Fields that are filtered/sorted on operationally (status, store, dates) remain first-class typed columns with indexes.

- Enumerated states are modeled as Postgres ENUM or checked VARCHAR (implementation detail left to the migration), always with an explicit terminal/initial state so the approval and candidate state machines in Section 3 are directly enforceable.

- Every relationship that the business explicitly described as N:N (Store↔SM) or 1:N with future-N:N potential (Area↔AM) is modeled as its own junction table rather than a foreign key on one side, so the cardinality can change without restructuring.

## **6.2 Entity Overview**

Tables are grouped by bounded context. Full column-level definitions follow in Section 6.3.

| **Context**             | **Tables**                                                                                  |
|-------------------------|---------------------------------------------------------------------------------------------|
| Identity & Access       | roles, users, audit_logs                                                                    |
| Master Data             | areas, stores, store_manager_assignments, area_manager_assignments, master_data_import_logs |
| Recruitment Requirement | job_requirements, job_requirement_versions, approval_actions                                |
| Scheduling              | interview_slots, interview_schedules                                                        |
| Candidate Engagement    | candidates, candidate_survey_tokens, candidate_survey_responses, blacklist_entries          |
| Notification            | notifications                                                                               |
| RikuOp Integration      | rikuop_sync_logs                                                                            |

## **6.3 Table Definitions**

***Table: roles***

*Fixed set of system roles, kept as a table (not a hard-coded enum) so future role types can be added administratively.*

| **Column**              | **Type**     | **Nullable** | **Description**                      |
|-------------------------|--------------|--------------|--------------------------------------|
| id                      | UUID (PK)    | NO           | Primary key                          |
| code                    | VARCHAR(20)  | NO           | Unique role code: HQ, AM, SM, SUB_SM |
| name                    | VARCHAR(100) | NO           | Display name                         |
| description             | TEXT         | YES          | Optional description                 |
| created_at / updated_at | TIMESTAMPTZ  | NO           | Audit timestamps                     |

***Table: users***

*All authenticated internal actors (HQ/AM/SM/Sub-SM). Candidates are intentionally not represented here - they never authenticate.*

| **Column**              | **Type**               | **Nullable** | **Description**                                  |
|-------------------------|------------------------|--------------|--------------------------------------------------|
| id                      | UUID (PK)              | NO           | Primary key                                      |
| employee_code           | VARCHAR(50)            | NO           | Unique code from master data import              |
| email                   | VARCHAR(255)           | NO           | Unique; used for login contact and notifications |
| password_hash           | VARCHAR(255)           | NO           | Salted hash (bcrypt/argon2); never plain text    |
| full_name               | VARCHAR(255)           | NO           | Display name                                     |
| phone                   | VARCHAR(20)            | YES          | Optional contact number                          |
| role_id                 | UUID (FK → roles.id)   | NO           | Assigned role                                    |
| status                  | ENUM(active, inactive) | NO           | Account status; default active                   |
| last_login_at           | TIMESTAMPTZ            | YES          | Last successful login                            |
| created_by / updated_by | UUID                   | YES          | Actor references for audit                       |
| created_at / updated_at | TIMESTAMPTZ            | NO           | Audit timestamps                                 |

***Table: areas***

*Geographic/organizational grouping of stores, owned by an AM.*

| **Column**              | **Type**     | **Nullable** | **Description**                                       |
|-------------------------|--------------|--------------|-------------------------------------------------------|
| id                      | UUID (PK)    | NO           | Primary key                                           |
| code                    | VARCHAR(50)  | NO           | Unique area code                                      |
| name                    | VARCHAR(255) | NO           | Area name                                             |
| block                   | VARCHAR(100) | YES          | Pending confirmation from client master-data template |
| created_by / updated_by | UUID         | YES          | Actor references for audit                            |
| created_at / updated_at | TIMESTAMPTZ  | NO           | Audit timestamps                                      |

***Table: stores***

*A physical store location, the primary unit that job requirements and interview schedules attach to.*

| **Column**              | **Type**                            | **Nullable** | **Description**                                                          |
|-------------------------|-------------------------------------|--------------|--------------------------------------------------------------------------|
| id                      | UUID (PK)                           | NO           | Primary key                                                              |
| code                    | VARCHAR(50)                         | NO           | Unique store code                                                        |
| name                    | VARCHAR(255)                        | NO           | Store name                                                               |
| area_id                 | UUID (FK → areas.id)                | NO           | Owning area                                                              |
| prefecture              | VARCHAR(100)                        | YES          | Pending confirmation from client master-data template                    |
| address                 | TEXT                                | YES          | Full address                                                             |
| allow_car_commute       | BOOLEAN                             | NO           | Default true; drives the candidate-facing car-commute notice             |
| publish_status          | ENUM(draft, published, unpublished) | NO           | Controls whether the store accepts new applications on the survey screen |
| created_by / updated_by | UUID                                | YES          | Actor references for audit                                               |
| created_at / updated_at | TIMESTAMPTZ                         | NO           | Audit timestamps                                                         |

***Table: area_manager_assignments***

*Assigns an AM (user) to one or more areas. Modeled as a junction table (rather than a column on areas) so the relationship can extend to N:N without restructuring if the business rule changes.*

| **Column** | **Type**             | **Nullable** | **Description**                                   |
|------------|----------------------|--------------|---------------------------------------------------|
| id         | UUID (PK)            | NO           | Primary key                                       |
| area_id    | UUID (FK → areas.id) | NO           | Managed area                                      |
| am_user_id | UUID (FK → users.id) | NO           | AM responsible for the area                       |
| created_at | TIMESTAMPTZ          | NO           | Assignment timestamp; unique(area_id, am_user_id) |

***Table: store_manager_assignments***

*Assigns SM/Sub-SM users to stores; the N:N relationship explicitly called out in the requirement document.*

| **Column**              | **Type**              | **Nullable** | **Description**                                                |
|-------------------------|-----------------------|--------------|----------------------------------------------------------------|
| id                      | UUID (PK)             | NO           | Primary key                                                    |
| store_id                | UUID (FK → stores.id) | NO           | Assigned store                                                 |
| user_id                 | UUID (FK → users.id)  | NO           | SM or Sub-SM                                                   |
| is_primary              | BOOLEAN               | NO           | true = SM (primary), false = Sub-SM; unique(store_id, user_id) |
| created_at / updated_at | TIMESTAMPTZ           | NO           | Audit timestamps                                               |

***Table: job_requirements***

*One requirement record per store per channel; tracks the current approval state and points at the currently active content version.*

| **Column**              | **Type**                                                                | **Nullable** | **Description**                                            |
|-------------------------|-------------------------------------------------------------------------|--------------|------------------------------------------------------------|
| id                      | UUID (PK)                                                               | NO           | Primary key                                                |
| store_id                | UUID (FK → stores.id)                                                   | NO           | Owning store                                               |
| channel                 | ENUM(web, other_media)                                                  | NO           | Requirement channel; unique(store_id, channel)             |
| status                  | ENUM(draft, pending_am, approved_am, pending_hq, approved_hq, rejected) | NO           | Approval state machine (Section 3.3)                       |
| current_version_id      | UUID (FK → job_requirement_versions.id)                                 | YES          | Points at the version currently being edited/reviewed      |
| published_version_id    | UUID (FK → job_requirement_versions.id)                                 | YES          | Last version that reached approved_hq; what candidates see |
| created_by / updated_by | UUID                                                                    | YES          | Actor references for audit                                 |
| created_at / updated_at | TIMESTAMPTZ                                                             | NO           | Audit timestamps                                           |

***Table: job_requirement_versions***

*Immutable snapshot of requirement content per edit cycle. JSONB payload absorbs field changes without migrations.*

| **Column**         | **Type**                        | **Nullable** | **Description**                                                                                |
|--------------------|---------------------------------|--------------|------------------------------------------------------------------------------------------------|
| id                 | UUID (PK)                       | NO           | Primary key                                                                                    |
| job_requirement_id | UUID (FK → job_requirements.id) | NO           | Parent requirement                                                                             |
| version_no         | INTEGER                         | NO           | Sequential per requirement; unique(job_requirement_id, version_no)                             |
| payload            | JSONB                           | NO           | Structured content: experience, wage, hours, dress code, items to bring, event-work flag, etc. |
| submitted_by       | UUID (FK → users.id)            | YES          | Who submitted this version for review                                                          |
| submitted_at       | TIMESTAMPTZ                     | YES          | Submission timestamp                                                                           |
| created_at         | TIMESTAMPTZ                     | NO           | Creation timestamp                                                                             |

***Table: approval_actions***

*Immutable, append-only log of every submit/approve/reject action against a requirement version.*

| **Column**                 | **Type**                      | **Nullable** | **Description**                          |
|----------------------------|-------------------------------|--------------|------------------------------------------|
| id                         | UUID (PK)                     | NO           | Primary key                              |
| job_requirement_version_id | UUID (FK)                     | NO           | Target version                           |
| actor_id                   | UUID (FK → users.id)          | NO           | Who performed the action                 |
| action                     | ENUM(submit, approve, reject) | NO           | Action type                              |
| comment                    | TEXT                          | YES          | Mandatory for reject, optional otherwise |
| created_at                 | TIMESTAMPTZ                   | NO           | Action timestamp                         |

***Table: blacklist_entries***

*Company-wide do-not-hire list, checked during candidate intake.*

| **Column**              | **Type**     | **Nullable** | **Description**                |
|-------------------------|--------------|--------------|--------------------------------|
| id                      | UUID (PK)    | NO           | Primary key                    |
| full_name               | VARCHAR(255) | YES          | Candidate name, if known       |
| phone                   | VARCHAR(20)  | YES          | Indexed for fast intake lookup |
| email                   | VARCHAR(255) | YES          | Indexed for fast intake lookup |
| reason                  | TEXT         | YES          | Reason for blacklisting        |
| created_by / updated_by | UUID         | YES          | Actor references for audit     |
| created_at / updated_at | TIMESTAMPTZ  | NO           | Audit timestamps               |

***Table: candidates***

*Master candidate record, sourced from RikuOp (or manual HQ registration).*

| **Column**              | **Type**                                                                                                                        | **Nullable** | **Description**                                    |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------|--------------|----------------------------------------------------|
| id                      | UUID (PK)                                                                                                                       | NO           | Primary key                                        |
| rikuop_candidate_id     | VARCHAR(100)                                                                                                                    | NO           | Unique external reference from RikuOp              |
| full_name               | VARCHAR(255)                                                                                                                    | NO           | Candidate name                                     |
| phone                   | VARCHAR(20)                                                                                                                     | YES          | Used for dedupe/blacklist match and SMS delivery   |
| email                   | VARCHAR(255)                                                                                                                    | YES          | Used for dedupe/blacklist match and email delivery |
| store_id                | UUID (FK → stores.id)                                                                                                           | YES          | Applied-to store                                   |
| status                  | ENUM(received, survey_sent, survey_completed, no_response, passed, failed, interview_scheduled, interview_completed, cancelled) | NO           | Candidate flow state (Section 3.4)                 |
| is_duplicate            | BOOLEAN                                                                                                                         | NO           | Set by intake dedupe logic; default false          |
| is_blacklisted          | BOOLEAN                                                                                                                         | NO           | Set by intake blacklist check; default false       |
| source                  | VARCHAR(50)                                                                                                                     | YES          | Intake source, e.g. rikuop, hq_manual              |
| created_at / updated_at | TIMESTAMPTZ                                                                                                                     | NO           | Audit timestamps                                   |

***Table: candidate_survey_tokens***

*Magic-link tokens that authorize a candidate's access to their webview screens without an account.*

| **Column**   | **Type**                  | **Nullable** | **Description**                              |
|--------------|---------------------------|--------------|----------------------------------------------|
| id           | UUID (PK)                 | NO           | Primary key                                  |
| candidate_id | UUID (FK → candidates.id) | NO           | Owning candidate                             |
| token_hash   | VARCHAR(255)              | NO           | Hashed token value; unique                   |
| expires_at   | TIMESTAMPTZ               | NO           | Expiry; enforced server-side on every access |
| used_at      | TIMESTAMPTZ               | YES          | Set on first use if the token is single-use  |
| created_at   | TIMESTAMPTZ               | NO           | Issue timestamp                              |

***Table: candidate_survey_responses***

*Candidate's submitted survey answers. JSONB fields absorb the client's evolving question set.*

| **Column**             | **Type**                  | **Nullable** | **Description**                                   |
|------------------------|---------------------------|--------------|---------------------------------------------------|
| id                     | UUID (PK)                 | NO           | Primary key                                       |
| candidate_id           | UUID (FK → candidates.id) | NO           | Unique - one response per candidate               |
| desired_store_ids      | JSONB                     | NO           | Applied stores (duplicates only)                  |
| experience             | TEXT                      | YES          | Food-service (inshoku) experience                 |
| desired_working_hours  | JSONB                     | YES          | Preferred working hours                           |
| desired_period         | VARCHAR(100)              | YES          | Desired employment duration                       |
| desired_days_per_week  | VARCHAR(50)               | YES          | Desired working days                              |
| other_conditions       | TEXT                      | YES          | Free-text other conditions                        |
| event_work             | BOOLEAN                   | NO           | Willingness for event (saiji) work; default false |
| contact_available_days | JSONB                     | YES          | Days easy to reach                                |
| contact_available_time | JSONB                     | YES          | Time window easy to reach                         |
| car_commute_note       | TEXT                      | YES          | Populated when the store disallows car commuting  |
| interview_type         | ENUM(web, onsite)         | NO           | Preferred interview format                        |
| preferred_dates        | JSONB                     | NO           | Up to three ranked preferred date/time choices    |
| submitted_at           | TIMESTAMPTZ               | NO           | Submission timestamp                              |

***Table: interview_slots***

*An open interview time slot, owned by an SM (not a store) to correctly model cross-store availability.*

| **Column**              | **Type**                   | **Nullable** | **Description**                                                |
|-------------------------|----------------------------|--------------|----------------------------------------------------------------|
| id                      | UUID (PK)                  | NO           | Primary key                                                    |
| store_id                | UUID (FK → stores.id)      | NO           | Store the slot is opened for                                   |
| sm_user_id              | UUID (FK → users.id)       | NO           | Responsible manager; unique(sm_user_id, slot_date, start_time) |
| slot_date               | DATE                       | NO           | Interview date                                                 |
| start_time / end_time   | TIME                       | NO           | Slot window                                                    |
| status                  | ENUM(open, booked, closed) | NO           | Current availability                                           |
| note                    | TEXT                       | YES          | Schedule memo                                                  |
| version                 | INTEGER                    | NO           | Optimistic-lock counter, incremented on every update           |
| created_by / updated_by | UUID                       | YES          | Actor references for audit                                     |
| created_at / updated_at | TIMESTAMPTZ                | NO           | Audit timestamps                                               |

***Table: interview_schedules***

*A confirmed booking linking a candidate to a slot; the record candidates see on the result/reminder screens.*

| **Column**              | **Type**                                       | **Nullable** | **Description**                                                                  |
|-------------------------|------------------------------------------------|--------------|----------------------------------------------------------------------------------|
| id                      | UUID (PK)                                      | NO           | Primary key                                                                      |
| candidate_id            | UUID (FK → candidates.id)                      | NO           | Booked candidate                                                                 |
| slot_id                 | UUID (FK → interview_slots.id)                 | NO           | Unique - one schedule per slot                                                   |
| store_id                | UUID (FK → stores.id)                          | NO           | Interview store                                                                  |
| status                  | ENUM(scheduled, changed, cancelled, completed) | NO           | Schedule lifecycle                                                               |
| interview_type          | ENUM(web, onsite)                              | NO           | Interview format                                                                 |
| location_info           | JSONB                                          | YES          | Address/directions/items to bring/dress code, or the web interview URL and notes |
| reminder_sent_at        | TIMESTAMPTZ                                    | YES          | Set once the 1-day-before reminder has been dispatched                           |
| created_by / updated_by | UUID                                           | YES          | Actor references for audit                                                       |
| created_at / updated_at | TIMESTAMPTZ                                    | NO           | Audit timestamps                                                                 |

***Table: notifications***

*Outbox for every SMS/Email, internal or candidate-facing, with delivery-state tracking and idempotency.*

| **Column**      | **Type**                       | **Nullable** | **Description**                                       |
|-----------------|--------------------------------|--------------|-------------------------------------------------------|
| id              | UUID (PK)                      | NO           | Primary key                                           |
| recipient_type  | ENUM(candidate, internal_user) | NO           | Target audience                                       |
| recipient_id    | UUID                           | NO           | candidates.id or users.id depending on recipient_type |
| channel         | ENUM(sms, email)               | NO           | Delivery channel                                      |
| template_code   | VARCHAR(100)                   | NO           | Message template identifier                           |
| payload         | JSONB                          | YES          | Template variables                                    |
| status          | ENUM(scheduled, sent, failed)  | NO           | Delivery state                                        |
| idempotency_key | VARCHAR(255)                   | NO           | Unique - prevents duplicate sends on retry/redelivery |
| scheduled_at    | TIMESTAMPTZ                    | NO           | When the message should be sent                       |
| sent_at         | TIMESTAMPTZ                    | YES          | Actual send timestamp                                 |
| retry_count     | INTEGER                        | NO           | Delivery attempts so far; default 0                   |
| error_message   | TEXT                           | YES          | Last failure reason                                   |
| created_at      | TIMESTAMPTZ                    | NO           | Creation timestamp                                    |

***Table: rikuop_sync_logs***

*Every inbound/outbound call to RikuOp, for failure diagnosis and spec-drift detection.*

| **Column**                         | **Type**                | **Nullable** | **Description**                                        |
|------------------------------------|-------------------------|--------------|--------------------------------------------------------|
| id                                 | UUID (PK)               | NO           | Primary key                                            |
| direction                          | ENUM(inbound, outbound) | NO           | Call direction                                         |
| entity_type                        | VARCHAR(50)             | NO           | e.g. candidate, interview_schedule                     |
| entity_id                          | VARCHAR(100)            | YES          | Related internal or external id                        |
| request_payload / response_payload | JSONB                   | YES          | Raw call data for diagnosis                            |
| status                             | ENUM(success, failed)   | NO           | Call outcome                                           |
| error_message                      | TEXT                    | YES          | Failure detail, including detected contract mismatches |
| created_at                         | TIMESTAMPTZ             | NO           | Call timestamp                                         |

***Table: audit_logs***

*System-wide operation log populated by the ActivityLoggingInterceptor for all non-GET requests.*

| **Column**               | **Type**     | **Nullable** | **Description**                                     |
|--------------------------|--------------|--------------|-----------------------------------------------------|
| id                       | UUID (PK)    | NO           | Primary key                                         |
| actor_id                 | UUID         | YES          | Acting user (null for system-initiated actions)     |
| actor_role               | VARCHAR(20)  | YES          | Role at time of action                              |
| action                   | VARCHAR(50)  | NO           | e.g. create, update, delete, approve, reject, login |
| entity_type              | VARCHAR(100) | NO           | Affected aggregate/table                            |
| entity_id                | VARCHAR(100) | YES          | Affected record id                                  |
| before_data / after_data | JSONB        | YES          | State diff for the change                           |
| ip_address               | VARCHAR(45)  | YES          | Request origin                                      |
| user_agent               | TEXT         | YES          | Request client                                      |
| created_at               | TIMESTAMPTZ  | NO           | Action timestamp                                    |

***Table: master_data_import_logs***

*Per-run record of master data import batches, with row-level outcome summary.*

| **Column**                              | **Type**                          | **Nullable** | **Description**                      |
|-----------------------------------------|-----------------------------------|--------------|--------------------------------------|
| id                                      | UUID (PK)                         | NO           | Primary key                          |
| import_type                             | ENUM(area, store, sm, sub_sm, am) | NO           | Imported entity type                 |
| file_name                               | VARCHAR(255)                      | NO           | Original uploaded file name          |
| imported_by                             | UUID (FK → users.id)              | NO           | HQ user who ran the import           |
| total_rows / success_rows / failed_rows | INTEGER                           | NO           | Row-level outcome summary            |
| error_detail                            | JSONB                             | YES          | Per-row error detail for failed rows |
| created_at                              | TIMESTAMPTZ                       | NO           | Import timestamp                     |

## **6.4 Concurrency Control**

The requirement document calls out three specific concurrent-write scenarios. Each is handled with a mechanism appropriate to its access pattern:

| **Scenario**                                                     | **Mechanism**                                                                                                                                                                                                                                                         |
|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| SM and Sub-SM editing the same store's job requirement           | Optimistic concurrency on job_requirements: the update carries the version the client last read; a stale write is rejected with a conflict error and the client is prompted to reload, rather than silently overwriting.                                              |
| HQ and SM operating on the same interview slot                   | Row-level pessimistic lock (SELECT ... FOR UPDATE) inside the booking transaction, plus the version counter on interview_slots for the read-modify-write path from the UI; whichever transaction commits first wins, the second fails fast and the client re-fetches. |
| Same SM's slot booked concurrently across two stores they manage | Structural prevention via the unique constraint on (sm_user_id, slot_date, start_time) combined with the booking transaction above - the second booking attempt fails at the database level even under a race, not just at the application level.                     |

##  **6.5 Database visualization**

![Database visualization](assets/media/image1.jpg)

See more here: [<u>Rakusai technical stuffs</u>](https://drive.google.com/drive/folders/1H1QTjQfIobqmgJjpuXDn8-Y3aSAHJ4qB?usp=sharing)

## **6.6 Queue flows visualization**

![Queue flows visualization](assets/media/image2.jpg)

See more here: [<u>Rakusai technical stuffs</u>](https://drive.google.com/drive/folders/1H1QTjQfIobqmgJjpuXDn8-Y3aSAHJ4qB?usp=sharing)

# **7. Non-Functional Requirements & Design Solutions**

## **7.1 Security**

- Passwords are salted-hashed (bcrypt/argon2); plain-text storage is never permitted.

- All input is re-validated server-side (class-validator DTOs) regardless of client-side zod validation.

- Every externally reachable endpoint passes through a uniform authentication/authorization middleware chain (guards) rather than per-controller ad hoc checks, avoiding accidental unprotected routes.

- Connection strings, API tokens, and other secrets live in environment variables / AWS Secrets Manager, never in source control.

- helmet, hpp, sanitizer, and express-rate-limit are applied globally to mitigate common HTTP-level attack vectors.

## **7.2 Operability**

- HQ workflows are designed PC-first; AM/SM/Sub-SM workflows are designed mobile-first with a shared responsive layout that also renders correctly on PC, per the requirement.

- A dedicated smartphone-optimized calendar component is used for the SM/Sub-SM schedule-setting screen (referencing the existing SP-specific calendar noted as open item 10-3).

## **7.3 Concurrency Control**

Covered in detail in Section 6.4; summarized here as a non-functional requirement: no concurrent update scenario identified in the requirement document may result in a silent lost update.

## **7.4 Notification Reliability**

- Every notification passes through the scheduled → sent/failed lifecycle described in Section 4.6, backed by a persisted idempotency key, so delayed processing cannot drop a recipient and retried processing cannot double-send.

## **7.5 External Integration Resilience**

- The RikuOp adapter isolates contract details from the domain (Section 4.7); failures are always logged with enough payload detail to diagnose whether the cause was transient (network/timeout) or a genuine spec change on RikuOp's side.

- Outbound calls use bounded retry with back-off via the same BullMQ infrastructure used for notifications, avoiding a second bespoke retry mechanism.

## **7.6 Scalability & Extensibility**

- DDD module boundaries (Section 2.3) mean new requirements - an additional approval step, a new candidate status, a new master-data entity - can usually be added inside one bounded context.

- JSONB payload fields on job requirements, survey responses, notifications, and schedule location info absorb field-level change without migrations, directly supporting the requirement's explicit call for a database design that anticipates future extension.

- created_by/updated_by plus the audit_logs table (also explicitly requested) mean operational history is captured from day one, not retrofitted later.

- Junction tables for Store↔SM and Area↔AM absorb cardinality changes without restructuring, and nullable, currently-unconfirmed fields (block, prefecture) are already present so onboarding is not blocked while those items are finalized with the client.

## **7.7 Observability**

- Structured logging throughout the API layer, correlated by request id.

- A health-check endpoint validates database and Redis connectivity (and, where applicable, the RikuOp integration) so deployment orchestration can make accurate readiness decisions.

# **8. Open Items Carried From the Requirement Document**

These items are explicitly marked as pending in the source requirement document. They do not block starting implementation, but each has a corresponding flexible design decision above so that resolving them later does not require structural rework.

### **To confirm during design**

- HQ-only PC screen visual design direction (multiple patterns may be proposed).

- UX for HQ specifying which SM an HQ-added slot belongs to, when a store has multiple managers.

- Reference design for the existing SP-specific schedule-setting calendar.

- Whether the requirement list can be a single unified view or must be split into "in progress" and "regular" lists.

### **To confirm before implementation begins**

- Job requirement import file format.

- Master-data link import/export file format.

- Reminder conditions: send-volume caps, send-time windows, and holiday handling for both approval and edit reminders.

### **To confirm before release**

- Cutover date: when the legacy system stops accepting new candidates and the new system goes live.

# **9. Appendix**

## **9.1 Glossary**

| **Term**    | **Meaning**                                                                                    |
|-------------|------------------------------------------------------------------------------------------------|
| HQ          | Head Quarter - global administrative role                                                      |
| AM          | Area Manager - approves job requirements for stores in their area                              |
| SM / Sub-SM | Store Manager / Deputy Store Manager - day-to-day store operator                               |
| RikuOp      | External recruitment management system that supplies candidates and receives status updates    |
| Magic Link  | Signed, time-limited URL that authorizes a candidate to reach their webview without an account |
| DDD         | Domain-Driven Design - architectural approach organizing code around business bounded contexts |
| RBAC        | Role-Based Access Control                                                                      |

## **9.2 Out of Scope (Confirmed) – for later (?)**

- Migration of historical data from the legacy system.

- Automatic monthly reset of approval status.

- IP-address-based access restriction.

- URL lookup by email screen (superseded by ID/password login).

- Candidate account issuance / candidate login.
