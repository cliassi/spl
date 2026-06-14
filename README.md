# Smart Package Locker

A full-stack package locker management system with secure storage, retrieval, and charge calculation.

**Live Demo**: Not deployed (local development only)  
**Repository**: https://github.com/cliassi/spl

---

## Quick Start

```bash
# Start all services (PostgreSQL, API, Web)
docker-compose up

# API: http://localhost:3000
# Web: http://localhost:5173
```

---

## My Approach

### Architecture: Modular Monolith with Clean Architecture

I chose a **modular monolith** over microservices because:
- The domain is bounded and well-defined (packages, lockers, assignments)
- Single deployable reduces operational complexity for an interview project
- Clear internal boundaries via domain modules achieve separation without network overhead

Within the monolith, I applied **Clean Architecture / Ports and Adapters**:
```
Presentation (Routes) → Application (Use Cases) → Domain (Entities) ← Infrastructure (Repositories)
```

Dependencies point **inward**—the domain knows nothing about PostgreSQL, Fastify, or React. This lets me:
- Test business logic without a database (in-memory repositories)
- Swap PostgreSQL for another database without touching use cases
- Reason about business rules in isolation

### Domain-Driven Design

I modeled the domain with proper DDD building blocks:

| Concept | Implementation | Example |
|---------|----------------|---------|
| **Entity** | Identity + mutable state | `Package` with `markAsStored()` |
| **Value Object** | Immutable, validated | `Size` enum with `canFitInside()` |
| **Domain Service** | Stateless operations | `PickupCodeService`, `ChargeCalculationService` |
| **Aggregate** | Consistency boundary | `Package` + `StorageAssignment` (via use case transaction) |
| **Repository** | Persistence abstraction | `PackageRepository` interface |

### Test-Driven Development

I wrote tests before implementation for:
- Domain entity state transitions (`Package.test.ts`)
- Use case scenarios (`RetrievePackageUseCase.test.ts`)
- Security properties (`PickupCodeService.test.ts`)

**Why TDD?** It forced me to think about edge cases upfront—race conditions, invalid state transitions, security vulnerabilities. The test suite (79 tests) now acts as regression protection and living documentation.

---

## Key Design Decisions & Tradeoffs

### 1. Clock Interface for Time-Based Logic

**Decision**: Abstract `Clock` interface with `SystemClock` and `FixedClock` implementations.

```typescript
export interface Clock {
  now(): Date;
}
```

**Tradeoff**: Added indirection vs. direct `new Date()` calls.

**Rationale**: Charge calculation depends on time (24h grace period). Without the abstraction:
- Tests would be flaky (timing-dependent)
- Can't test multi-day charges deterministically
- Can't simulate edge cases (exactly 24h, 24h + 1ms)

### 2. Hashed Pickup Codes with One-Time Display

**Decision**: Store bcrypt hash, return plaintext once, never again.

```typescript
const { plaintext, hash } = await pickupCodeService.generate();
// Return plaintext to user
// Store hash in database
// If user loses code, they can't retrieve package (security feature)
```

**Tradeoff**: User loses code = package unrecoverable vs. secure system.

**Rationale**: Password storage best practice. If database leaks, attacker can't retrieve packages. The alternative (reversible encryption) adds complexity and reduces security.

### 3. Generic Error Messages for Retrieval Failures

**Decision**: All retrieval failures return `INVALID_PICKUP_CODE` regardless of root cause.

```typescript
case 'PACKAGE_ALREADY_RETRIEVED':
case 'LOCKER_NOT_FOUND':
case 'INVALID_PICKUP_CODE':
  return { error: 'INVALID_PICKUP_CODE', message: 'Invalid pickup code or locker code.' };
```

**Tradeoff**: Poorer UX (can't tell user "package already retrieved") vs. security.

**Rationale**: Prevents information leakage. Attacker can't enumerate valid locker codes or determine if a package exists. In a real system, this would pair with audit logging (not implemented here) for security monitoring.

### 4. Integer Money (Minor Units)

**Decision**: Store charges as cents (`amountMinorUnits: 500` = $5.00), never floating-point.

**Tradeoff**: Less readable in code vs. precise financial calculations.

**Rationale**: Floating-point arithmetic is unsafe for money (0.1 + 0.2 ≠ 0.3). This prevents rounding errors in charge calculation. Display formatting handles the conversion for UI.

### 5. Immutable Entities

**Decision**: Entities return new instances on state change.

```typescript
markAsStored(): Package {
  return new Package({ ...this.props, status: STORED });
}
```

**Tradeoff**: Memory overhead (new objects) vs. safety.

**Rationale**: Prevents accidental mutation, makes state changes explicit in code, enables time-travel debugging (keep history of entity states).

---

## Assumptions Made

1. **Single Location**: The system models one locker location. Multi-location would add a `Location` aggregate and complicate allocation.

2. **No Authentication**: Anyone with a pickup code can retrieve a package. Real system would add recipient registration, email verification, 2FA for high-value packages.

3. **No Real-Time Notifications**: No WebSocket/SSE for "package stored" notifications. Assumes recipient checks manually or gets email outside this system.

4. **Grace Period is 24 Hours**: Hardcoded in `ChargeCalculationService`. Configurable per-locker-location would be a future enhancement.

5. **No Admin Interface**: No UI for administrators to view all packages, override retrievals, or manage lockers. Assumes direct database access for ops.

6. **Currency is USD**: Hardcoded. Multi-currency would require exchange rates and location-based defaults.

7. **Lockers are Fixed Size**: Small/Medium/Large only. Real lockers might have variable dimensions or "oversized" category.

8. **One Package Per Locker**: Simplifies allocation. Real system might support multiple small packages in one large locker.

---

## Project Structure

```
spl/
├── apps/
│   ├── api/               # Fastify + Drizzle ORM
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── lockers/      # Locker management domain
│   │       │   └── packages/     # Package storage/retrieval domain
│   │       │       ├── domain/entities/, services/
│   │       │       ├── application/useCases/, ports/
│   │       │       ├── infrastructure/repositories/
│   │       │       └── presentation/routes/
│   │       └── server.ts
│   └── web/               # React + TanStack Query
│       └── src/
│           ├── api/          # API client functions
│           ├── components/   # React components (forms, success views)
│           └── routes/       # Page-level components
├── .ai/                   # AI governance (sprints, ADRs, tasks)
├── docs/                  # API documentation
└── compose.yaml          # Docker Compose (PostgreSQL, API, Web)
```

---

## Testing

```bash
# Unit tests (79 tests)
cd apps/api && pnpm test:unit

# E2E tests (Playwright)
cd apps/web && pnpm test:e2e

# E2E with UI mode (for debugging)
cd apps/web && pnpm test:e2e:ui
```

**Test Coverage**:

| Type | Count | Scope |
|------|-------|-------|
| Unit Tests | 79 | Domain, use cases, services |
| E2E Tests | 15+ | Full user flows (store, retrieve, locker inventory) |

**Testing Strategy**:
- **Unit tests** for domain logic (fast, isolated)
- **Mocked repositories** for use case tests
- **E2E tests** for critical user flows (Playwright)
- **Cross-browser testing** (Chrome, Firefox, Safari, Mobile)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, TanStack Query |
| Backend | Fastify, TypeScript, Zod (validation) |
| Database | PostgreSQL 16, Drizzle ORM |
| Testing | Vitest, Playwright |
| DevOps | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| AI Governance | Custom `.ai/` directory structure |

---

## What I'd Add With More Time

1. **Transaction Management**: Wrap use cases in database transactions (currently sequential calls)
2. **Audit Logging**: Log every retrieval attempt (success + failure) for security review
3. **Rate Limiting**: Prevent brute force on pickup codes (e.g., 5 attempts per 15 minutes)
4. **Admin Dashboard**: View all packages, filter by status, export reports
5. **Email Notifications**: Send pickup code via email/SMS on package storage
6. **Time-Limited Codes**: Expire pickup codes after N days for abandoned packages
7. **Locker Health Monitoring**: Detect and alert on malfunctioning lockers
8. **Visual Regression Testing**: Add Playwright screenshot comparisons for UI stability
8. **API Documentation**: OpenAPI/Swagger spec with interactive docs

---

## Why This Approach?

I optimized for **clarity over cleverness**. The code should be readable by a new team member without explanation. Every abstraction (Clock interface, repository ports) exists to solve a specific problem (testability, swappability), not for architectural purity.

The project demonstrates:
- **Engineering rigor**: TDD, SOLID principles, clean architecture
- **Security awareness**: bcrypt, constant-time comparison, generic errors
- **Domain modeling**: Proper entities, value objects, state machines
- **Production patterns**: Ports/adapters, dependency injection, immutable entities

---

**Built with care for the interview challenge.**
