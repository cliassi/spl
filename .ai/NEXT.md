# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 3 — Package Storage 🚀 IN_PROGRESS
- **Active Task**: SPL-210 — Package Storage UI
- **Status**: IN_PROGRESS (on feat/SPL-210 branch)
- **Repository State**: Sprint 2 complete, SPL-209 committed
- **Passing Checks**: All Sprint 3 backend tasks complete
- **Blockers**: None

## Sprint 3 Progress

| Task | Story Points | Status |
|------|--------------|--------|
| SPL-206 | 3 | ✅ DONE — Package Domain Model |
| SPL-207 | 2 | ✅ DONE — Pickup Code Generation & Hashing |
| SPL-208 | 3 | ✅ DONE — Store Package Use Case |
| SPL-209 | 2 | ✅ DONE — Package Storage API |
| **SPL-210** | 3 | 🔄 IN_PROGRESS — Package Storage UI |

**Completed:** 10/13 points (77%) | **Sprint 3 Total:** 13 points

## Just Completed — SPL-209

**Package Storage API** committed to `feat/SPL-209`:

- POST /api/v1/packages endpoint with Zod validation
- Request/response schemas with proper types
- PackageRepositoryPostgres implementation
- StorageAssignmentRepositoryPostgres implementation
- Error handling: 400, 409, 422, 500 status codes
- Wired up in server.ts

## Next Action — SPL-210

**Package Storage UI** — React form for delivery agents:

1. **Route**: `/packages/store` or modal component

2. **Form Fields**:
   - Package Reference (text input)
   - Size Selection (radio buttons: SMALL, MEDIUM, LARGE)
   - Submit button with loading state

3. **Success View**:
   - Locker Code (prominent display)
   - Pickup Code (prominent display with warning)
   - Warning message: "Save your pickup code - it will not be shown again"

4. **Error Handling**:
   - Validation errors (inline)
   - 409 Conflict (duplicate reference)
   - 422 No suitable locker
   - 500 Server error

5. **Files to Create**:
   - `apps/web/src/api/packageApi.ts` — API client
   - `apps/web/src/components/packages/StorePackageForm.tsx` — Form component
   - `apps/web/src/components/packages/StorePackageSuccess.tsx` — Success view
   - `apps/web/src/routes/packages/StorePackagePage.tsx` — Page component

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Create API client for package storage endpoint.
4. Implement StorePackageForm component.
5. Implement success view with pickup code display.
6. Create page component and wire up routes.
7. Update governance records.
