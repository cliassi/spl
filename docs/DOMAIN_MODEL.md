# Domain Model Documentation

## Overview

This document describes the domain model for the Smart Package Locker Management System. It defines the core entities, value objects, invariants, state transitions, and business rules.

## Core Concepts

### Locker

A physical storage compartment with a fixed size.

**Attributes**:
- `id` (UUID) — Internal system identifier
- `code` (string) — Human-readable unique identifier (e.g., "L-S-001", "L-M-002")
- `size` (LockerSize) — SMALL, MEDIUM, or LARGE
- `createdAt` (timestamp) — When the locker was added to the system
- `updatedAt` (timestamp) — Last modification time

**Behavior**:
- A locker can hold at most one active package at a time
- Availability is derived from storage assignments (no `status` field stored)

### Package

An item to be stored with a reference number and size.

**Attributes**:
- `id` (UUID) — Internal system identifier
- `reference` (string) — External unique reference (e.g., "PKG-10001")
- `size` (PackageSize) — SMALL, MEDIUM, or LARGE
- `status` (PackageStatus) — CREATED, STORED, or RETRIEVED
- `storedAt` (timestamp, nullable) — When the package was stored
- `retrievedAt` (timestamp, nullable) — When the package was retrieved
- `createdAt` (timestamp) — When the package was registered
- `updatedAt` (timestamp) — Last modification time

**Behavior**:
- Must be assigned to a locker of equal or larger size
- State transitions are explicit and validated

### Storage Assignment

An association between a locker and a package during the storage period.

**Attributes**:
- `id` (UUID) — Internal system identifier
- `lockerId` (UUID) — Reference to the assigned locker
- `packageId` (UUID) — Reference to the stored package
- `pickupCodeHash` (string) — Secure hash of the pickup code (plaintext never stored)
- `assignedAt` (timestamp) — When the assignment was created
- `retrievedAt` (timestamp, nullable) — When the package was retrieved
- `storageChargeMinorUnits` (bigint, nullable) — Calculated charge in minor units
- `currency` (char(3), nullable) — Currency code (e.g., "USD")
- `createdAt` (timestamp) — When the record was created
- `updatedAt` (timestamp) — Last modification time

**Behavior**:
- Only one active assignment per locker (enforced by database constraint)
- Retrieved assignments remain as historical records

## Value Objects

### LockerSize / PackageSize

Enumeration of sizes with ordering:

```
SMALL < MEDIUM < LARGE
```

Size compatibility: A package fits in a locker if `packageSize <= lockerSize`.

### PackageStatus

Enumeration of package states:

- `CREATED` — Package registered but not yet stored
- `STORED` — Package currently in a locker
- `RETRIEVED` — Package has been retrieved

### PickupCode

A cryptographically secure random code used for retrieval.

**Properties**:
- 8 alphanumeric characters (e.g., "A7B9X2K1")
- Generated using cryptographically secure random number generator
- Plaintext returned exactly once during storage
- Only hash is persisted
- Verified using constant-time comparison

## State Transitions

### Package Lifecycle

```
┌─────────┐    store()     ┌─────────┐    retrieve()    ┌───────────┐
│ CREATED │ ─────────────→ │ STORED  │ ───────────────→ │ RETRIEVED │
└─────────┘                └─────────┘                  └───────────┘
```

**Valid Transitions**:
- `CREATED → STORED`: When package is assigned to a locker
- `STORED → RETRIEVED`: When package is retrieved with valid pickup code

**Invalid Transitions**:
- `CREATED → RETRIEVED` (must be stored first)
- `RETRIEVED → *` (terminal state)
- `STORED → CREATED` (irreversible)

### Storage Assignment Lifecycle

```
┌─────────┐    retrieve()    ┌───────────┐
│ ACTIVE  │ ───────────────→ │ COMPLETED │
└─────────┘                  └───────────┘
```

Where:
- `ACTIVE`: `assignedAt` is set, `retrievedAt` is null
- `COMPLETED`: `retrievedAt` is set

### Locker Availability

Locker availability is derived, not stored:

```
available = NOT EXISTS (
  SELECT 1 FROM storage_assignments
  WHERE locker_id = :locker_id
  AND retrieved_at IS NULL
)
```

This is enforced by a PostgreSQL partial unique index:
```sql
CREATE UNIQUE INDEX idx_unique_active_assignment
ON storage_assignments (locker_id)
WHERE retrieved_at IS NULL;
```

## Invariants (Business Rules)

1. **Single Occupancy**: A locker can contain at most one active package
2. **Size Compatibility**: A package must fit inside its locker (package size ≤ locker size)
3. **Smallest Suitable**: Select the smallest available locker that can accommodate the package
4. **Deterministic Selection**: Selection within the same size must be deterministic (e.g., by locker code)
5. **No Suitable Locker**: If no suitable locker exists, return a clear domain error
6. **Secure Pickup Code**: Storing a package generates a cryptographically secure pickup code
7. **One-Time Code Return**: Return the plaintext pickup code exactly once
8. **Hashed Storage**: Persist only a secure hash of the pickup code
9. **Verification Required**: Retrieval requires the locker identifier and correct pickup code
10. **Invalid Code Handling**: Invalid, expired, or reused codes must fail with generic error
11. **Locker Release**: Successful retrieval releases the locker for reuse
12. **Idempotency**: Retrieval must be idempotent or explicitly reject repeated retrieval consistently
13. **Explicit State Transitions**: Package and assignment state transitions must be explicit and validated
14. **Extended Charges**: Extended storage charges begin after a configurable grace period
15. **Money Representation**: Monetary amounts must use integer minor units, never floating-point
16. **Time Injection**: Time-dependent behavior must use an injected Clock (not system time directly)
17. **Concurrency Safety**: Concurrent requests must never allocate the same locker (database-enforced)
18. **Transactional Operations**: Storage and retrieval operations must be transactional
19. **Input Validation**: All inputs must be validated at the API boundary

## Allocation Policy

The policy for selecting a locker when storing a package:

### Algorithm

1. **Filter**: Find all lockers where `locker.size >= package.size` AND locker is available
2. **Categorize**: Group by size (SMALL, MEDIUM, LARGE)
3. **Select Size**: Choose the smallest size category that has available lockers
4. **Select Locker**: Within the selected size, choose deterministically (e.g., lowest locker code)
5. **Return**: Return the selected locker, or `NO_SUITABLE_LOCKER` error if none found

### Example

Available lockers:
- L-S-001 (SMALL)
- L-S-002 (SMALL)
- L-M-001 (MEDIUM)
- L-L-001 (LARGE)

Package sizes and selected lockers:
| Package Size | Selected Locker | Reason |
|--------------|-----------------|--------|
| SMALL | L-S-001 | Smallest suitable |
| MEDIUM | L-M-001 | Exact match, no SMALL fits |
| LARGE | L-L-001 | Exact match, no smaller fits |

## Charge Policy

### Configuration

- **Grace Period**: 24 hours (free storage)
- **Charge Per Day**: 500 minor units ($5.00)
- **Currency**: USD (configurable)
- **Rounding**: Round up to nearest started day

### Calculation

```
if stored_duration <= grace_period:
  charge = 0
else:
  additional_days = ceiling((stored_duration - grace_period) / 1_day)
  charge = additional_days * charge_per_day
```

### Boundary Behavior

| Scenario | Stored Duration | Charge |
|----------|-----------------|--------|
| Just before grace expiry | 23h 59m 59s | 0 |
| Exactly at grace expiry | 24h 00m 00s | 0 |
| One second after expiry | 24h 00m 01s | 500 |
| One full day after expiry | 48h 00m 00s | 500 |
| Multiple days after expiry | 72h 00m 00s | 1000 |

### Time Handling

- All times are UTC
- No timezone conversion
- Clock is injected for testability

## Domain Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `NO_SUITABLE_LOCKER` | 409 Conflict | No locker available that fits the package |
| `INVALID_PICKUP_CODE` | 401 Unauthorized | Pickup code is incorrect (generic error for security) |
| `PACKAGE_ALREADY_RETRIEVED` | 409 Conflict | Package has already been retrieved |
| `INVALID_LOCKER_CODE` | 404 Not Found | Locker identifier does not exist |
| `PACKAGE_NOT_FOUND` | 404 Not Found | Package identifier does not exist |
| `VALIDATION_ERROR` | 400 Bad Request | Request validation failed |

**Security Note**: For retrieval failures, return generic `INVALID_PICKUP_CODE` to prevent information leakage. Do not distinguish between wrong code, already retrieved, or non-existent package.

## Assumptions and Clarifications

The following clarifications were made where the challenge brief was ambiguous:

### 1. Locker Identification

**Assumption**: Lockers have both a system UUID (`id`) and a human-readable code (`code`).

**Rationale**: UUIDs are for internal references; human-readable codes (e.g., "L-M-001") are for API and UI display.

### 2. Package Reference Uniqueness

**Assumption**: Package `reference` field is unique across all packages.

**Rationale**: Provides a business identifier that doesn't expose internal UUIDs.

### 3. Pickup Code Format

**Assumption**: Pickup codes are 8 alphanumeric characters (e.g., "A7B9X2K1").

**Rationale**: 
- 8 characters = 2.8 × 10^14 combinations (sufficient entropy)
- Alphanumeric excludes ambiguous characters (0, O, 1, I) for readability
- Uppercase for consistency

### 4. Grace Period Duration

**Assumption**: Default grace period is 24 hours.

**Rationale**: Common industry practice for package lockers.

### 5. Currency Precision

**Assumption**: Use integer minor units (cents) for all monetary amounts.

**Rationale**: Avoids floating-point rounding errors, industry best practice.

### 6. Timezone Handling

**Assumption**: All times are stored and compared in UTC.

**Rationale**: Simplifies implementation, sufficient for this scope.

### 7. Deterministic Selection

**Assumption**: When multiple lockers of the same size are available, select by lowest locker code.

**Rationale**: Provides consistent, testable behavior.

### 8. Historical Records

**Assumption**: Storage assignments are retained as historical records after retrieval.

**Rationale**: Supports audit trails, charge calculation verification, and analytics.

### 9. Charge Calculation Timing

**Assumption**: Charges are calculated at retrieval time and stored on the assignment.

**Rationale**: Provides a record of what was charged, supports dispute resolution.

### 10. Concurrent Allocation Strategy

**Assumption**: Use database-level concurrency control (partial unique index + row locking).

**Rationale**: Application-level locking is insufficient for concurrent requests.

## Future Considerations

The following are documented but **not implemented**:

1. **Authentication**: Would add user/role concepts to storage and retrieval operations
2. **Time-Limited Codes**: Pickup codes could expire after a period
3. **Multi-Currency**: Currency conversion if international use cases emerge
4. **Notification Events**: Email/SMS when package stored
5. **Reservation**: Lock a locker before physical arrival
6. **Size Measurement**: Dynamic sizing based on actual package dimensions

See ADRs for architectural decisions and `.ai/decisions/` for detailed rationale.
