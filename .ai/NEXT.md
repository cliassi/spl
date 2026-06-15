# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 4 — Package Retrieval 🚀 IN_PROGRESS
- **Active Task**: SPL-211 — Retrieve Package Use Case
- **Status**: Just started, on feat/SPL-211 branch
- **Repository State**: Sprint 3 complete, ready for retrieval implementation
- **Passing Checks**: All tests passing, governance updated
- **Blockers**: None

## 🎉 Sprint 4 — Package Retrieval: 0% → 100%

| Task | Story Points | Status |
|------|--------------|--------|
| **SPL-211** | 3 | 🔄 IN_PROGRESS — Retrieve Package Use Case |
| SPL-212 | 2 | ⏳ BACKLOG — Pickup Code Verification Service |
| SPL-213 | 2 | ⏳ BACKLOG — Package Retrieval API |
| SPL-214 | 3 | ⏳ BACKLOG — Charge Calculation Service |
| SPL-215 | 3 | ⏳ BACKLOG — Package Retrieval UI |

**Total**: 13 points | **Completed**: 0/13 points (0%)

## Sprint 4 Goal

Enable recipients to retrieve packages using pickup codes, releasing lockers for reuse and calculating storage charges.

## Just Completed — Sprint 3

**Package Storage** fully operational:
- Domain model with state machine
- Secure pickup code generation
- Smallest suitable locker allocation
- Full-stack implementation (API + UI)

## Next Action — SPL-211

**Retrieve Package Use Case** — Core business logic:

1. **Input**: lockerCode, pickupCode
2. **Verify**: Find active assignment by locker code
3. **Validate**: Constant-time pickup code verification
4. **Transition**: Package STORED → RETRIEVED
5. **Release**: Mark assignment completed, locker available
6. **Return**: Package details + calculated charges

**Files to Create**:
- `apps/api/src/modules/packages/application/useCases/RetrievePackageUseCase.ts`
- `apps/api/src/modules/packages/application/useCases/RetrievePackageUseCase.test.ts`

**Error Handling**:
- `INVALID_PICKUP_CODE` — Generic error for all failures (security)
- `PACKAGE_ALREADY_RETRIEVED` — Terminal state
- `LOCKER_NOT_FOUND` — Invalid locker code

## Sprint 4 Features

### Backend
- RetrievePackageUseCase with verification logic
- ChargeCalculationService (24h grace + $5/day)
- POST /api/v1/packages/retrieval endpoint
- Constant-time code verification

### Frontend
- Retrieval form (locker code + pickup code)
- Success view with storage duration and charges
- Generic error handling (no info leakage)

## Project Totals

| Sprint | Story Points | Status |
|--------|--------------|--------|
| Sprint 1 — Foundation | 10 | ✅ COMPLETE |
| Sprint 2 — Locker Inventory | 12 | ✅ COMPLETE |
| Sprint 3 — Package Storage | 13 | ✅ COMPLETE |
| **Sprint 4 — Package Retrieval** | **13** | 🚀 **IN_PROGRESS** |
| **Grand Total** | **48** | **73% Complete** |

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Create RetrievePackageUseCase with verification logic.
4. Add unit tests for all scenarios.
5. Update governance records.
