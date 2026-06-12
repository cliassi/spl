# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 3 — Package Storage 🚀 IN_PROGRESS
- **Active Task**: SPL-207 — Pickup Code Generation & Hashing
- **Status**: IN_PROGRESS (on feat/SPL-207 branch)
- **Repository State**: Sprint 2 complete, SPL-206 committed
- **Passing Checks**: All Sprint 3 tasks committed
- **Blockers**: None

## Sprint 3 Progress

| Task | Story Points | Status |
|------|--------------|--------|
| SPL-206 | 3 | ✅ DONE — Package Domain Model |
| SPL-207 | 2 | ✅ DONE — Pickup Code Generation & Hashing |
| **SPL-208** | 3 | 🔄 IN_PROGRESS — Store Package Use Case |
| SPL-209 | 2 | ⏳ BACKLOG — Package Storage API |
| SPL-210 | 3 | ⏳ BACKLOG — Package Storage UI |

**Completed:** 5/13 points (38%) | **Sprint 3 Total:** 13 points

## Just Completed — SPL-207

**Pickup Code Generation & Hashing** committed to `feat/SPL-207`:

- crypto.randomInt for cryptographically secure 6-digit code generation
- bcrypt hashing with cost factor 12
- Constant-time verification via bcrypt.compare()
- Plaintext returned only during generation
- 12 security-focused unit tests

## Next Action — SPL-208

**Store Package Use Case** — Core business operation:

1. **Use Case Responsibilities**:
   - Accept package reference and size
   - Apply allocation policy (smallest suitable available locker)
   - Generate pickup code via PickupCodeService
   - Create Package entity (CREATED → STORED)
   - Create StorageAssignment with pickup code hash
   - Return plaintext pickup code exactly once

2. **Allocation Policy**:
   - Find smallest suitable available locker
   - Deterministic selection when multiple same-size lockers
   - Fail gracefully if no suitable locker available

3. **Transactional Requirements**:
   - Atomic: package + assignment created together
   - Rollback on any failure
   - Idempotent handling for duplicate requests

4. **Files to Create**:
   - `apps/api/src/modules/packages/application/useCases/StorePackageUseCase.ts`
   - `apps/api/src/modules/packages/application/useCases/StorePackageUseCase.test.ts`
   - `apps/api/src/modules/packages/application/ports/PackageRepository.ts`
   - `apps/api/src/modules/packages/application/ports/StorageAssignmentRepository.ts`

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Implement repository ports for packages and storage assignments.
4. Implement StorePackageUseCase with allocation policy.
5. Write unit tests for use case.
6. Update governance records.
