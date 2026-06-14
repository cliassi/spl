# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 4 — Package Retrieval 🚀 IN_PROGRESS
- **Active Task**: SPL-213 — Package Retrieval API
- **Status**: On feat/SPL-213 branch, implementing API endpoint
- **Repository State**: SPL-211 committed, use case ready for API integration
- **Passing Checks**: All 79 tests passing
- **Blockers**: None

## 🎉 Sprint 4 — Package Retrieval: 62% → 100%

| Task | Story Points | Status |
|------|--------------|--------|
| SPL-211 | 3 | ✅ DONE — Retrieve Package Use Case (committed) |
| SPL-212 | 2 | ✅ DONE — Pickup Code Verification (integrated in SPL-211) |
| **SPL-213** | 2 | 🔄 **IN_PROGRESS** — Package Retrieval API |
| SPL-214 | 3 | ✅ DONE — Charge Calculation (integrated in SPL-211) |
| SPL-215 | 3 | ⏳ BACKLOG — Package Retrieval UI |

**Total**: 13 points | **Completed**: 8/13 points (62%)

## Sprint 4 Goal

Enable recipients to retrieve packages using pickup codes, releasing lockers for reuse and calculating storage charges.

## Just Completed — SPL-211

**Retrieve Package Use Case** fully implemented:
- Clock interface for testable time
- ChargeCalculationService (24h grace + $5/day)
- Secure pickup code verification (bcrypt constant-time)
- Generic error messages for security
- 13 comprehensive unit tests

## Next Action — SPL-213

**Package Retrieval API** — REST endpoint:

**Endpoint**: `POST /api/v1/packages/retrieval`

**Request**:
```json
{
  "lockerCode": "L-M-001",
  "pickupCode": "123456"
}
```

**Response (200 OK)**:
```json
{
  "packageId": "uuid",
  "packageReference": "PKG-10001",
  "lockerCode": "L-M-001",
  "storedAt": "2025-06-12T15:30:00.000Z",
  "retrievedAt": "2025-06-14T10:15:00.000Z",
  "storageDuration": "1 day, 18 hours",
  "storageCharge": {
    "amountMinorUnits": 500,
    "currency": "USD",
    "displayAmount": "$5.00"
  }
}
```

**Error Response (401)**:
```json
{
  "code": "INVALID_PICKUP_CODE",
  "message": "Invalid pickup code or locker code."
}
```

**Files to Create**:
- `apps/api/src/modules/packages/presentation/schemas/retrievalSchemas.ts` — Zod schemas
- Update `apps/api/src/modules/packages/presentation/routes/packageRoutes.ts` — Add endpoint
- Wire in `apps/api/src/server.ts` — Ensure routes registered

## Security Requirements

- Generic `INVALID_PICKUP_CODE` for all failures (no info leakage)
- Never distinguish between: wrong code, already retrieved, non-existent locker
- Input validation at API boundary

## Project Totals

| Sprint | Story Points | Status |
|--------|--------------|--------|
| Sprint 1 — Foundation | 10 | ✅ COMPLETE |
| Sprint 2 — Locker Inventory | 12 | ✅ COMPLETE |
| Sprint 3 — Package Storage | 13 | ✅ COMPLETE |
| **Sprint 4 — Package Retrieval** | **13** | 🚀 **IN_PROGRESS** (8/13 done) |
| **Grand Total** | **48** | **79% After Sprint 4** |

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Create retrieval Zod schemas with validation.
4. Add POST /api/v1/packages/retrieval endpoint.
5. Wire routes in server.ts.
6. Update governance records.
