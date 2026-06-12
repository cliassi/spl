# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 2 — Locker Inventory
- **Active Task**: SPL-204 — Locker Inventory UI
- **Status**: IN_PROGRESS (creating React page)
- **Repository State**: API complete (SPL-203), ready for frontend
- **Passing Checks**: All JSON validated, backend complete
- **Blockers**: None

## Sprint 2 Progress

| Task | Story Points | Status |
|------|--------------|--------|
| SPL-201 | 2 | ✅ DONE — Size value object |
| SPL-202 | 3 | ✅ DONE — Locker Repository |
| SPL-203 | 2 | ✅ DONE — Locker Listing API |
| **SPL-204** | 3 | 🔄 IN_PROGRESS — Locker Inventory UI |
| SPL-205 | 2 | ⏳ BACKLOG — Integration Tests |

**Completed:** 7/12 points | **In Progress:** 3 points | **Remaining:** 2 points

## Just Completed — SPL-203

**Locker Listing API** (`apps/api/src/modules/lockers/presentation/routes/lockerRoutes.ts`):

- GET /api/v1/lockers with size/available filters
- GET /api/v1/lockers/:id by UUID
- GET /api/v1/lockers/code/:code by locker code
- Zod validation and error handling
- Fastify server with security middleware

## Next Action — SPL-204

**Locker Inventory UI** — Create React page for locker inventory:

1. **Route**: `/lockers` in React Router
2. **Features**:
   - Display list of lockers with filters
   - Size filter: SMALL, MEDIUM, LARGE, ALL
   - Availability filter: available only or all
   - Visual indicators for availability
3. **Components**:
   - LockerList — main list with filters
   - LockerCard — individual locker display
   - SizeFilter — dropdown for size selection
   - AvailabilityFilter — toggle for available only
4. **Data Fetching**: TanStack Query (React Query) to call API
5. **States**: Loading, error, empty, success

## Files to Create

- `apps/web/src/routes/lockers/LockersPage.tsx` — Main page component
- `apps/web/src/components/lockers/LockerList.tsx` — List with filters
- `apps/web/src/components/lockers/LockerCard.tsx` — Card display
- `apps/web/src/hooks/useLockers.ts` — TanStack Query hook
- `apps/web/src/api/lockerApi.ts` — API client functions

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Review API response format.
4. Implement React components with TanStack Query.
5. Update governance records.
