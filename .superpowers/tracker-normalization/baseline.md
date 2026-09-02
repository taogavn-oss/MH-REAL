# Tracker normalization baseline — 2026-09-02

- Declared tasks: 379
- Checked tasks: 362
- Status `DONE`: 362
- Status `BLOCKED`: 17
- Status `READY`: 0
- Status `IN_PROGRESS`: 0
- Evidence rows: 4 (`EV-20260902-001` through `EV-20260902-004`)

## RED condition

The checklist invariant requires each `[x][DONE]` atom to have a valid evidence row. Four rows cannot support 362 checked task declarations. The direct evidence mapping will be recomputed during reconciliation; this baseline records the structural mismatch without treating a textual reference to an ID as verification.

## Preserved evidence-backed atoms

- `BLD-BE-BE-01` → `EV-20260902-001`
- `TST-BE-QA-01` → `EV-20260902-002`
- `IMPL-FE-QA-01` → `EV-20260902-003`
- `P1-PRISMA-BE-01` → `EV-20260902-004`
