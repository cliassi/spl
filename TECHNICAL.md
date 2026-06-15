# Technical Documentation

Complete technical specification for the Smart Package Locker system, documenting all architectural decisions, design patterns, and implementation choices.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Design Decisions](#3-design-decisions)
4. [Domain Model](#4-domain-model)
5. [Security Architecture](#5-security-architecture)
6. [Concurrency Strategy](#6-concurrency-strategy)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment & Operations](#8-deployment--operations)
9. [Trade-offs & Rationale](#9-trade-offs--rationale)

---

## 1. Architecture Overview

### 1.1 Architectural Style: Modular Monolith with Clean Architecture

**Decision:** Use a modular monolith instead of microservices.

**Why:**
- Domain is bounded and well-defined (packages, lockers, assignments)
- Single deployable reduces operational complexity for an interview project
- Network overhead unnecessary for this scale
- Clear internal boundaries via domain modules achieve separation without distribution complexity

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  REST API   │  │    React    │  │ Playwright E2E   │   │
│  │  (Fastify)  │  │    (Vite)   │  │     Tests        │   │
│  └──────┬──────┘  └─────────────┘  └──────────────────┘   │
├───────┬──────────────────────────────────────────────────────┤
│       │              Application Layer                       │
│  ┌────▼─────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Use Cases   │  │    Ports    │  │  DTOs/Commands   │   │
│  │Store/Retrieve│  │(Interfaces) │  │                  │   │
│  └──────────────┘  └─────────────┘  └──────────────────┘   │
├────────────────────────────────────────────────────────────┤
│                    Domain Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │  Entities   │  │Value Objects│  │ Domain Services  │     │
│  │  Package    │  │    Size     │  │PickupCodeService │     │
│  │  Locker     │  │  Money      │  │ChargeCalculation │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
├────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ PostgreSQL  │  │  Drizzle    │  │  Repositories    │   │
│  │   (Docker)  │  │    ORM      │  │(PostgreSQL Impl) │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule:** Dependencies point **inward** only. Domain knows nothing about:
- PostgreSQL
- Fastify
- React
- HTTP
- Database transactions

---

## 2. Technology Stack

### 2.1 Backend

| Component | Technology | Why |
|-----------|------------|-----|
| Runtime | Node.js 24.x | LTS, TypeScript native, interview standard |
| Framework | Fastify | Performance, type safety, good plugin system |
| ORM | Drizzle | Type-safe SQL, lightweight, good migrations |
| Database | PostgreSQL | ACID compliance, partial unique indexes for concurrency |
| Validation | Zod | Runtime validation, TypeScript inference |
| Testing | Vitest | Jest alternative, native ESM support, fast |
| Auth | bcrypt | Pickup code hashing (not storage) |

### 2.2 Frontend

| Component | Technology | Why |
|-----------|------------|-----|
| Framework | React 19 | Latest features, good ecosystem |
| Build | Vite | Fast dev, native ESM |
| Routing | React Router v7 | Standard, nested routes |
| Forms | React Hook Form | Performance, validation integration |
| Query | TanStack Query | Caching, background updates |
| Styling | CSS Modules | Scoped styles, no build complexity |
| Testing | Playwright | Real browser testing, reliable |

### 2.3 Tooling

| Component | Technology | Why |
|-----------|------------|-----|
| Package Manager | pnpm | Fast, disk efficient, workspace support |
| Monorepo | pnpm workspaces | Simple, no extra tooling |
| Linting | ESLint | Standard, TypeScript support |
| Formatting | Prettier | Consistent code style |
| Containers | Docker Compose | Easy local development |
| CI/CD | GitHub Actions | Integrated, free for open source |

---

## 3. Design Decisions

### 3.1 Domain-Driven Design (DDD)

**Decision:** Apply DDD patterns consistently.

**Why:** Aligns with Clean Architecture, makes domain logic explicit and testable.

**Patterns Applied:**

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Entity** | `Package`, `Locker`, `StorageAssignment` | Identity + mutable state with behavior |
| **Value Object** | `Size`, `Money` | Immutable, validated, compared by value |
| **Domain Service** | `PickupCodeService`, `ChargeCalculationService` | Stateless operations spanning entities |
| **Repository** | `PackageRepository`, `LockerRepository` | Persistence abstraction |
| **Aggregate** | `Package` + `StorageAssignment` (loose) | Consistency boundary via use case |

### 3.2 Clock Abstraction

**Decision:** Abstract `Clock` interface for time-based logic.

```typescript
export interface Clock {
  now(): Date;
}
```

**Why:**
- Charge calculation depends on time (24h grace period)
- Without abstraction: tests would be flaky (timing-dependent)
- Can't test multi-day charges deterministically
- Production uses `SystemClock`, tests use `FixedClock`

**Trade-off:** Added indirection vs. direct `new Date()` calls.

### 3.3 Result Pattern

**Decision:** Use discriminated unions for operation results instead of exceptions.

```typescript
type StorePackageResult = 
  | { success: true; pickupCode: string; lockerCode: string }
  | { success: false; error: 'DUPLICATE_REFERENCE' | 'NO_SUITABLE_LOCKER' | ... };
```

**Why:**
- Forces callers to handle both success and failure cases
- Type-safe error handling
- Domain errors become explicit in type system
- No hidden control flow via exceptions

**Trade-off:** More verbose than throwing exceptions, but more explicit.

### 3.4 Generic Error Messages (Security)

**Decision:** Return generic error messages for security-sensitive operations.

**Implementation:**
```typescript
// Instead of "Invalid pickup code" or "Locker not found"
return { success: false, error: 'INVALID_REQUEST' };
```

**Why:**
- Prevents information leakage about valid lockers/packages
- Attacker can't enumerate lockers by error messages
- Follows OWASP guidelines for authentication/authorization errors

**Trade-off:** Harder debugging for legitimate users, but security priority.

---

## 4. Domain Model

### 4.1 Core Entities

#### Package

```typescript
class Package {
  private constructor(props: PackageProps) { ... }
  
  static create(props: PackageCreationProps): Package;
  markAsStored(locker: Locker, clock: Clock): void;
  markAsRetrieved(clock: Clock): ChargeResult;
  
  get id(): string;
  get status(): 'PENDING' | 'STORED' | 'RETRIEVED';
  get reference(): string;
  get size(): Size;
}
```

**Behavior:**
- Created in PENDING status
- Transitions to STORED when assigned to locker
- Transitions to RETRIEVED with charge calculation

#### Locker

```typescript
class Locker {
  private constructor(props: LockerProps) { ... }
  
  static create(props: LockerCreationProps): Locker;
  occupy(): void;
  release(): void;
  
  get code(): string;
  get size(): Size;
  get isOccupied(): boolean;
  canAccommodate(packageSize: Size): boolean;
}
```

**Behavior:**
- Immutable size after creation
- Occupancy tracked via separate StorageAssignment

#### StorageAssignment

```typescript
class StorageAssignment {
  private constructor(props: StorageAssignmentProps) { ... }
  
  static create(props: AssignmentCreationProps): StorageAssignment;
  markAsRetrieved(clock: Clock): void;
  
  get packageId(): string;
  get lockerId(): string;
  get pickupCodeHash(): string;
  get storedAt(): Date;
  get retrievedAt(): Date | null;
  get isActive(): boolean;
}
```

**Behavior:**
- Links Package to Locker
- Stores bcrypt hash of pickup code
- Soft delete (mark retrieved) rather than hard delete

### 4.2 Value Objects

#### Size

```typescript
class Size {
  private constructor(value: SizeValue) { ... }
  
  static small(): Size;
  static medium(): Size;
  static large(): Size;
  static fromString(size: string): Size;
  
  canFitInside(other: Size): boolean;
  lessThan(other: Size): boolean;
  equals(other: Size): boolean;
}
```

**Why Value Object:**
- Immutable (no setters)
- Validated at creation (only 0, 1, 2)
- Compared by value, not identity
- Business logic (canFitInside) intrinsic to concept

#### Money

```typescript
class Money {
  private constructor(amountInCents: number) { ... }
  
  static fromDollars(dollars: number): Money;
  static zero(): Money;
  
  add(other: Money): Money;
  multiply(factor: number): Money;
  toDollars(): number;
  toString(): string;
}
```

**Why Integer Cents:**
- Avoid floating-point precision issues
- Standard practice for financial calculations
- PostgreSQL stores as INTEGER

---

## 5. Security Architecture

### 5.1 Pickup Code Security

**Decision:** Store only bcrypt hashes, never plaintext.

**Flow:**
```
Storage:                           Retrieval:
┌─────────────┐                   ┌─────────────┐
│ Pickup Code │                   │ Enter Code  │
│  (plaintext)│                   │  (plaintext)│
└──────┬──────┘                   └──────┬──────┘
       │                                  │
       ▼                                  ▼
┌─────────────┐                   ┌─────────────┐
│  bcrypt     │                   │  bcrypt     │
│   hash      │                   │  compare    │
└──────┬──────┘                   └──────┬──────┘
       │                                  │
       ▼                                  ▼
┌─────────────┐                   ┌─────────────┐
│ Store Hash  │                   │ Match? Yes  │
│  (in DB)    │                   │  → Unlock   │
└─────────────┘                   │ Match? No   │
                                  │  → Generic  │
                                  │   Error     │
                                  └─────────────┘
```

**Rationale:**
- Database breach doesn't expose usable pickup codes
- bcrypt is slow (intentional) - prevents brute force
- Constant-time comparison prevents timing attacks

### 5.2 One-Time Code Display

**Decision:** Return plaintext pickup code exactly once during storage.

**Why:**
- After storage, only hash exists in system
- User must save code - no "forgot my code" feature by design
- Forces user responsibility for code safekeeping

### 5.3 Information Leakage Prevention

**Decision:** Generic error messages for all failure cases.

| Scenario | Error Shown to User | Real Reason |
|----------|---------------------|-------------|
| Wrong locker code | "Invalid request" | Locker doesn't exist |
| Wrong pickup code | "Invalid request" | Code doesn't match |
| Package already retrieved | "Invalid request" | Status is RETRIEVED |
| Locker occupied | "Invalid request" | Assignment exists |

**Why:** Prevents attacker enumeration:
- Can't discover valid locker codes by probing
- Can't determine if package exists by error
- Can't tell which part of code is wrong

---

## 6. Concurrency Strategy

### 6.1 Problem Statement

Race condition: Two concurrent storage requests could:
1. Both query for available lockers
2. Both see same locker as available
3. Both assign that locker
4. Result: Double assignment of same locker

### 6.2 Solution: Database-Level Protection

**Decision:** Use PostgreSQL partial unique index.

```sql
CREATE UNIQUE INDEX "unique_active_locker_assignment" 
ON "storage_assignments" ("locker_id") 
WHERE "retrieved_at" IS NULL;
```

**Why:**
- Database is source of truth for consistency
- Partial index: only active (non-retrieved) assignments must be unique
- After retrieval, locker can be reassigned (index doesn't apply)
- No application-level locking needed

### 6.3 Fallback Behavior

If constraint triggers:
```typescript
try {
  await db.insert(storageAssignments).values(assignment);
} catch (error) {
  if (error.code === '23505') { // Unique violation
    // Return "No suitable locker" - locker was taken
    return { success: false, error: 'NO_SUITABLE_LOCKER' };
  }
}
```

**Why:** Graceful degradation - user sees appropriate error.

### 6.4 Testing Strategy

**Integration Test:** Fire 10 concurrent requests, verify:
- No double locker assignments
- Correct number of successes/failures
- Database state consistent

See: `ConcurrentRequest.test.ts`

---

## 7. Testing Strategy

### 7.1 Test Pyramid

```
        /\
       /  \
      / E2E\      (Playwright - 3 tests)
     /________\     Real browser flows
    /          \
   / Integration \  (Repository tests - 27 tests)
  /______________\   Database + API
 /                \
/     Unit Tests   \ (Domain + Use Cases - 91+ tests)
/____________________\  Fast, isolated, deterministic
```

### 7.2 Unit Test Strategy

**Domain Tests:**
- Entity state transitions
- Value object validation
- Domain service calculations
- Invariant enforcement

**Use Case Tests:**
- Success scenarios
- Error cases (all branches)
- Repository interactions
- Security properties

**Why Mock Repositories:**
- Tests run in milliseconds
- No database setup needed
- Deterministic (no data conflicts)
- Parallel execution safe

### 7.3 Integration Test Strategy

**Repository Tests:**
- Real PostgreSQL via Docker
- Schema migrations applied
- Actual SQL queries execute

**API Tests:**
- Fastify app.inject() for HTTP
- Request/response validation
- Error handling verification

### 7.4 E2E Test Strategy

**Playwright:**
- Real browser automation
- User journey testing
- Cross-browser compatibility

**Serial Execution:**
- Tests run sequentially (not parallel)
- Database cleanup between tests
- Prevents locker contention

### 7.5 Test Data Management

**Factories (not fixtures):**
```typescript
// Create valid entities for tests
const testPackage = Package.create({
  reference: `TEST-${Date.now()}`,
  size: Size.small(),
});
```

**Why:**
- Each test creates own data
- No shared state
- No brittle fixtures to maintain

---

## 8. Deployment & Operations

### 8.1 Local Development

```bash
# One command starts everything
docker-compose up

# Services:
# - PostgreSQL: localhost:5432
# - API: localhost:3000
# - Web: localhost:5173
```

**Why Docker Compose:**
- Single command for new developers
- Consistent environment
- Database initialized automatically

### 8.2 Database Migrations

**Drizzle Kit:**
```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

**Why:**
- Type-safe schema changes
- Version controlled SQL
- Rollback capability

### 8.3 Production Considerations (Not Implemented)

**Intentionally Excluded:**
- Kubernetes (overkill for interview)
- Redis (session caching not needed)
- Kafka (event streaming not in requirements)
- Multiple microservices (unnecessary complexity)
- Cloud-specific services (AWS/GCP/Azure)

**Reason:** Focus on demonstrating engineering principles, not infrastructure complexity.

---

## 9. Trade-offs & Rationale

### 9.1 Modular Monolith vs Microservices

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Complexity** | Low | High |
| **Network Calls** | None | Many |
| **Deployment** | Single artifact | Orchestration needed |
| **Team Scaling** | Limited | Better for large teams |
| **Interview Fit** | ✅ Perfect | Overkill |

**Verdict:** Monolith with clear internal modules.

### 9.2 Clean Architecture vs Simple MVC

| Aspect | Clean Arch | Simple MVC |
|--------|-----------|------------|
| **Testability** | Excellent | Poor (DB coupling) |
| **Learning Curve** | Steep | Shallow |
| **Boilerplate** | More | Less |
| **Interview Impression** | ✅ Demonstrates expertise | Basic |

**Verdict:** Clean Architecture to showcase engineering depth.

### 9.3 PostgreSQL vs SQLite

| Aspect | PostgreSQL | SQLite |
|--------|-----------|--------|
| **Concurrency** | Excellent (MVCC) | Limited |
| **Partial Indexes** | ✅ Yes | No |
| **Docker Integration** | ✅ Perfect | File-based |
| **Interview Standard** | ✅ Production-like | Prototype |

**Verdict:** PostgreSQL for real-world relevance.

### 9.4 bcrypt vs Simple Hash

| Aspect | bcrypt | SHA-256 |
|--------|--------|---------|
| **Slow by Design** | ✅ Yes | No (fast) |
| **Salt Included** | ✅ Automatic | Manual |
| **Brute Force Resistant** | ✅ Yes | No |
| **Performance** | Slower | Faster |

**Verdict:** bcrypt despite slower performance (security > speed for this use case).

### 9.5 Generic Errors vs Specific Errors

| Aspect | Generic | Specific |
|--------|---------|----------|
| **User Experience** | Poorer | Better |
| **Security** | ✅ Excellent | Information leakage |
| **Debugging** | Harder | Easier |

**Verdict:** Generic errors - security is non-negotiable.

---

## 10. Future Enhancements (Out of Scope)

If this were a production system, next features would be:

1. **Authentication & Authorization**
   - User accounts
   - Role-based access (admin, operator, customer)

2. **Payment Processing**
   - Stripe/PayPal integration
   - Pre-payment for storage charges

3. **Real-time Notifications**
   - WebSockets for locker status updates
   - SMS notifications via Twilio

4. **Monitoring & Observability**
   - Structured logging (Pino)
   - Metrics (Prometheus)
   - Tracing (OpenTelemetry)

5. **Scalability**
   - Redis for session caching
   - Read replicas for queries
   - Event sourcing for audit trail

6. **Mobile App**
   - React Native
   - QR code scanning for pickup

**Why Excluded:** Out of interview scope - focus on demonstrating core engineering competency.

---

## 11. Key Files Reference

| Purpose | File Path |
|---------|-----------|
| **Architecture** | `README.md` (approach section) |
| **Testing Guide** | `HOW_TO_TEST.md` |
| **API Routes** | `apps/api/src/server.ts` |
| **Domain Entities** | `apps/api/src/modules/*/domain/entities/*.ts` |
| **Use Cases** | `apps/api/src/modules/*/application/useCases/*.ts` |
| **Repositories** | `apps/api/src/modules/*/infrastructure/repositories/*.ts` |
| **Database Schema** | `apps/api/src/infrastructure/database/schema.ts` |
| **E2E Tests** | `apps/web/e2e/*.spec.ts` |

---

## 12. Summary

This system demonstrates:

✅ **SOLID Principles** - Single responsibility, dependency inversion  
✅ **Clean Architecture** - Layered, testable, maintainable  
✅ **Domain-Driven Design** - Proper entities, value objects, services  
✅ **Test-Driven Development** - 91+ tests, behavior-focused  
✅ **Security Awareness** - Hashing, generic errors, no leakage  
✅ **Concurrency Handling** - Database-level protection  
✅ **Professional Tooling** - Docker, CI/CD, linting, formatting  

The architecture prioritizes **clarity over cleverness**, **maintainability over premature optimization**, and **correctness over convenience**.

---

*Document Version: 1.0*  
*Last Updated: June 2026*
