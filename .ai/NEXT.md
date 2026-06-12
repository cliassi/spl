# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 3 — Package Storage 🚀 IN_PROGRESS
- **Active Task**: SPL-209 — Package Storage API
- **Status**: IN_PROGRESS (on feat/SPL-209 branch)
- **Repository State**: Sprint 2 complete, SPL-208 committed
- **Passing Checks**: All Sprint 3 tasks committed
- **Blockers**: None

## Sprint 3 Progress

| Task | Story Points | Status |
|------|--------------|--------|
| SPL-206 | 3 | ✅ DONE — Package Domain Model |
| SPL-207 | 2 | ✅ DONE — Pickup Code Generation & Hashing |
| SPL-208 | 3 | ✅ DONE — Store Package Use Case |
| **SPL-209** | 2 | 🔄 IN_PROGRESS — Package Storage API |
| SPL-210 | 3 | ⏳ BACKLOG — Package Storage UI |

**Completed:** 8/13 points (62%) | **Sprint 3 Total:** 13 points

## Just Completed — SPL-208

**Store Package Use Case** committed to `feat/SPL-208`:

- PackageRepository and StorageAssignmentRepository ports
- StorePackageUseCase with allocation policy
- Idempotent duplicate handling
- Race condition protection (double-check locker availability)
- 12 comprehensive unit tests

## Next Action — SPL-209

**Package Storage API** — REST endpoint for storing packages:

1. **Endpoint**: `POST /api/v1/packages`

2. **Request Body**:
   ```json
   {
     "reference": "PKG-001",
     "size": "SMALL"
   }
   ```

3. **Success Response (201)**:
   ```json
   {
     "packageId": "uuid",
     "lockerCode": "L-S-001",
     "pickupCode": "123456",
     "message": "Package stored successfully. Save your pickup code - it will not be shown again."
   }
   ```

4. **Error Responses**:
   - `400` - Invalid request body (validation error)
   - `409` - Duplicate reference (already exists)
   - `422` - No suitable locker available
   - `500` - Storage operation failed

5. **Files to Create**:
   - `apps/api/src/modules/packages/presentation/schemas/packageSchemas.ts`
   - `apps/api/src/modules/packages/presentation/routes/packageRoutes.ts`
   - Wire up routes in server.ts

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Implement Zod schemas for package API.
4. Create POST /api/v1/packages route handler.
5. Wire up routes in server.ts.
6. Update governance records.
