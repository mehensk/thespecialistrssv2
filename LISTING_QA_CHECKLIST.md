# Listing Data Loading QA Checklist

Use this after each phase.
Mark each item as PASS or FAIL with notes.

---

## Pre-Phase Baseline (run once before Phase 1)

- [ ] Record average API response time for:
  - `GET /api/listings?published=true` (10 requests)
- [ ] Record current update reflect time:
  - Edit published listing title -> time until visible on `/listings`
- [ ] Record current delete reflect time:
  - Delete published listing -> time until removed from `/listings`
- [ ] Save notes/screenshots

---

## Phase 1 QA: Cache Invalidation + Freshness

### Update Reflect Test
- [ ] Open `/listings` in browser tab A
- [ ] In tab B, edit a published listing title from admin
- [ ] Refresh tab A every 2-3 seconds
- [ ] Confirm new title appears quickly

Result:
- [ ] Pass if reflect time is usually under 5s

### Delete Reflect Test
- [ ] Open `/listings` in browser tab A
- [ ] In tab B, delete a published listing from admin
- [ ] Refresh tab A every 2-3 seconds
- [ ] Confirm listing disappears quickly

Result:
- [ ] Pass if reflect time is usually under 5s

---

## Phase 2 QA: Public API Fast Path

### Latency Sampling
Run 10 times:
```bash
curl -w "time_total=%{time_total}\n" -o NUL -s "http://localhost:3000/api/listings?published=true"
```

- [ ] Record average time
- [ ] Record max time
- [ ] Compare with baseline

Result:
- [ ] Pass if average and max are lower/more stable than baseline

### Functional Check
- [ ] Public listings still load normally
- [ ] No auth leakage (private/unpublished listings not exposed publicly)

---

## Phase 3 QA: Server Filtering/Pagination + Client Resilience

### Filter Accuracy
- [ ] Apply listingType filter (`sale`, `rent`) and verify expected records
- [ ] Apply propertyType filter and verify expected records
- [ ] Apply city + price range combined filters
- [ ] Remove filters and confirm total returns to expected value

Result:
- [ ] Pass if results are consistent and accurate

### Pagination Accuracy
- [ ] Verify total count and total pages
- [ ] Verify item count per page is correct
- [ ] Verify no duplicates across adjacent pages
- [ ] Verify sorting order remains correct across pages

Result:
- [ ] Pass if counts/order are correct

### Failure UX Check
- [ ] Simulate temporary API failure (stop API briefly or block request)
- [ ] Confirm UI shows explicit error/retry state (not false empty list)
- [ ] Retry action recovers correctly

Result:
- [ ] Pass if user always sees recoverable error state

---

## Phase 4 QA: DB Optimization + Monitoring

### Query/Endpoint Performance
- [ ] Capture before/after timing for listings endpoint
- [ ] Confirm improved or stable latency after index changes
- [ ] Confirm no slowdown on update/delete operations

Result:
- [ ] Pass if performance is improved or at least not regressed

### Data Correctness
- [ ] New listings appear correctly
- [ ] Updated listings reflect correctly
- [ ] Deleted listings are removed correctly
- [ ] Sort order remains correct (`newest`)

Result:
- [ ] Pass if no correctness regressions

### Monitoring/Observability
- [ ] Verify logs/metrics include endpoint latency
- [ ] Verify errors are visible and searchable
- [ ] Verify cache-related events are observable (if implemented)

Result:
- [ ] Pass if regressions can be detected quickly

---

## Final Go/No-Go

- [ ] All phase checks passed
- [ ] No unresolved data accuracy issues
- [ ] No unresolved reflect-time issues
- [ ] No severe regression in API latency

Decision:
- [ ] GO
- [ ] NO-GO (list blockers)
