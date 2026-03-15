# New-Chat Handoff Prompt (Phase 2)

Use this prompt in a new chat:

---
You are continuing the Search Function Revamp in this repo.

First, read and review this file completely before doing any code changes:
- `docs/search-function-revamp.md`

Treat the Phase 1 closure in that file as the source of truth for completed work, locked decisions, and deferred scope.

Then implement **Phase 2 only** from that exact state:
1. Add backend-filtered search support in `GET /api/listings`.
2. Keep compatibility with existing behavior where possible.
3. Return filtered results with pagination metadata (`items`, `total`, `page`, `limit`, `totalPages`).
4. Apply the shared search contract (`src/lib/search-contract.ts`) for parsing/validation/canonicalization.
5. Do not implement schema migrations or normalized DB columns yet (those are a later phase).

Implementation constraints:
- Preserve continuity with current code and prior intent.
- Do not undo or bypass Phase 1 canonical query flow in Hero/Listings.
- Maintain accuracy-first behavior for filtered requests.
- Keep changes scoped to Phase 2 (no unrelated refactors).

Before edits:
- Summarize what you read in `docs/search-function-revamp.md` under:
  - Completed
  - Decisions locked
  - Deferred

After edits:
- Update `docs/search-function-revamp.md` with a new "Phase 2 Closure" section.
- Include exactly what was implemented, what changed behaviorally, what was deferred, and verification results.
- Provide a concise risk/impact note for Phase 2.

Validation:
- Run relevant lint/tests for touched files.
- If tooling blocks full validation, state exactly what was run and what remains.
---
