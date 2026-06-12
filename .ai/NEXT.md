# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 3 — Package Storage 🚀 IN_PROGRESS
- **Active Task**: SPL-206 — Package Domain Model
- **Status**: IN_PROGRESS (on feat/SPL-206 branch)
- **Repository State**: Sprint 2 complete, Sprint 3 started
- **Passing Checks**: Sprint 2 all tasks committed and pushed
- **Blockers**: None

## Sprint 3 Progress

| Task | Story Points | Status |
|------|--------------|--------|
| **SPL-206** | 3 | 🔄 IN_PROGRESS — Package Domain Model |
| SPL-207 | 2 | ⏳ BACKLOG — Pickup Code Generation & Hashing |
| SPL-208 | 3 | ⏳ BACKLOG — Store Package Use Case |
| SPL-209 | 2 | ⏳ BACKLOG — Package Storage API |
| SPL-210 | 3 | ⏳ BACKLOG — Package Storage UI |

**Completed:** 0/13 points (0%) | **Sprint 3 Total:** 13 points

## Previous Sprint

**Sprint 2 — Locker Inventory**: ✅ COMPLETE (12/12 points)

## Next Action — SPL-206

**Package Domain Model** — Core entities for package storage:

1. **Package Entity**:
   - `reference`: Unique package identifier (string)
   - `size`: Size value object (SMALL, MEDIUM, LARGE)
   - `status`: Enum (CREATED, STORED, RETRIEVED)
   - `storedAt`: Timestamp when stored
   - `retrievedAt`: Timestamp when retrieved
   - `createdAt`, `updatedAt`: Audit timestamps

2. **StorageAssignment Entity**:
   - `packageId`: Reference to package
   - `lockerId`: Reference to locker
   - `pickupCodeHash`: Secure hash of pickup code (never plaintext)
   - `createdAt`: When assignment was created

3. **Domain Invariants**:
   - One active package per locker maximum
   - Package state transitions: CREATED → STORED → RETRIEVED
   - StoredAt set when status changes to STORED
   - RetrievedAt set when status changes to RETRIEVED

4. **Files to Create**:
   - `apps/api/src/modules/packages/domain/entities/Package.ts`
   - `apps/api/src/modules/packages/domain/entities/StorageAssignment.ts`
   - `apps/api/src/modules/packages/domain/entities/Package.test.ts`
   - `apps/api/src/modules/packages/domain/entities/StorageAssignment.test.ts`
   - `apps/api/src/modules/packages/domain/enums/PackageStatus.ts`

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Implement Package entity with state transitions.
4. Implement StorageAssignment entity.
5. Write unit tests for entities.
6. Update governance records.
