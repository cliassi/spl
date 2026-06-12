# Smart Package Locker — Next Action

## Current State

- **Sprint**: Sprint 2 — Locker Inventory
- **Active Task**: SPL-203 — Locker Listing API
- **Status**: IN_PROGRESS (implementing GET /api/v1/lockers)
- **Repository State**: Repository complete (SPL-202), ready for API implementation
- **Passing Checks**: All JSON validated, domain and repository layers complete
- **Blockers**: None

## Sprint 2 Progress

| Task | Story Points | Status |
|------|--------------|--------|
| SPL-201 | 2 | ✅ DONE — Size value object |
| SPL-202 | 3 | ✅ DONE — Locker Repository |
| **SPL-203** | 2 | 🔄 IN_PROGRESS — Locker Listing API |
| SPL-204 | 3 | ⏳ BACKLOG — Locker Inventory UI |
| SPL-205 | 2 | ⏳ BACKLOG — Integration Tests |

**Completed:** 7/12 points | **In Progress:** 2 points | **Remaining:** 3 points

## Just Completed — SPL-202

**Locker Repository** (`apps/api/src/modules/lockers/infrastructure/repositories/LockerRepositoryPostgres.ts`):

- Port interface: `LockerRepository` with 6 methods
- Entity: `Locker` with validation and `canAccommodate()`
- PostgreSQL implementation using Drizzle ORM
- Availability check via `storage_assignments` join
- Smallest suitable allocation: `findSmallestSuitableLocker()`
- Committed to `feat/SPL-201-size-model` branch

## Next Action — SPL-203

**Locker Listing API** — Implement GET /api/v1/lockers:

1. **Route**: `GET /api/v1/lockers`
2. **Query Parameters**:
   - `size` (optional): Filter by locker size (SMALL, MEDIUM, LARGE)
   - `available` (optional): Filter to available lockers only (true/false)
3. **Response**: Array of lockers with `id`, `code`, `size`, `isAvailable`
4. **Error Handling**: Invalid filter values return 400 Bad Request

## Files to Create

- `apps/api/src/modules/lockers/presentation/routes/lockerRoutes.ts` — Fastify route handlers
- `apps/api/src/modules/lockers/presentation/schemas/lockerSchemas.ts` — Zod validation schemas
- `apps/api/src/server.ts` — Fastify server setup (if not exists)

## Implementation Plan

1. Create Zod schemas for request validation and response serialization
2. Create route handler using LockerRepository to fetch data
3. Map domain entities to DTOs for API responses
4. Register route in Fastify app
5. Add error handling middleware

## Resume Protocol

When the user says "continue":
1. Read this file (`.ai/NEXT.md`).
2. Read active task from `.ai/tasks/active.json`.
3. Review existing LockerRepository interface.
4. Implement route handler with validation.
5. Update governance records.
