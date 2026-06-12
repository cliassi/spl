# Domain Memory: Smart Package Locker

## Business Terms

| Term | Definition |
|------|------------|
| **Locker** | A physical storage compartment of a specific size |
| **Package** | An item to be stored with a reference number and size |
| **Storage Assignment** | Association between a locker and a package during storage |
| **Pickup Code** | A cryptographically secure code for package retrieval |
| **Grace Period** | Free storage duration before charges apply |
| **Extended Storage Charge** | Fee for storage beyond grace period |

## Locker Sizes

- `SMALL`
- `MEDIUM`
- `LARGE`

Size order: `SMALL < MEDIUM < LARGE`

## Package Sizes

- `SMALL`
- `MEDIUM`
- `LARGE`

## Core Rules (Invariants)

1. **Single Occupancy**: A locker can contain at most one active package
2. **Size Compatibility**: A package must fit inside its locker (package size ≤ locker size)
3. **Smallest Suitable**: Select the smallest available locker that can accommodate the package
4. **Deterministic Selection**: Selection within the same size must be deterministic
5. **No Suitable Locker**: If no suitable locker exists, return a clear domain error
6. **Secure Pickup Code**: Storing a package generates a cryptographically secure pickup code
7. **One-Time Code Return**: Return the plaintext pickup code exactly once
8. **Hashed Storage**: Persist only a secure hash of the pickup code
9. **Verification Required**: Retrieval requires the locker identifier and correct pickup code
10. **Invalid Code Handling**: Invalid, expired, or reused codes must fail
11. **Locker Release**: Successful retrieval releases the locker
12. **Idempotency**: Retrieval must be idempotent or explicitly reject repeated retrieval consistently
13. **State Transitions**: Package and assignment state transitions must be explicit
14. **Extended Charges**: Extended storage charges begin after a configurable grace period
15. **Money Representation**: Monetary amounts must use integer minor units, never floating-point
16. **Time Injection**: Time-dependent behavior must use an injected Clock
17. **Concurrency Safety**: Concurrent requests must never allocate the same locker
18. **Transactional Operations**: Storage and retrieval operations must be transactional
19. **Input Validation**: Inputs must be validated at the API boundary

## State Transitions

### Package States

```
CREATED → STORED → RETRIEVED
```

### Storage Assignment States

```
ACTIVE (assigned_at set, retrieved_at null)
COMPLETED (retrieved_at set)
```

### Locker Availability

Derived from active assignments: a locker is available if no active assignment exists for it.

## Allocation Policy

1. Filter lockers with size ≥ package size
2. Select smallest size category that has available lockers
3. Within the selected size, choose deterministically (e.g., lowest locker code)
4. If no lockers in any suitable size category, return `NO_SUITABLE_LOCKER` error

## Charge Policy

**Example Configuration**:
- First 24 hours: free
- After 24 hours: fixed amount per started additional day
- Currency: USD (configurable)

**Rounding Behavior**: To be determined and documented

## Domain Errors

| Error Code | Description |
|------------|-------------|
| `NO_SUITABLE_LOCKER` | No locker can accommodate the package |
| `INVALID_PICKUP_CODE` | Pickup code is incorrect |
| `PACKAGE_ALREADY_RETRIEVED` | Package has already been retrieved |
| `INVALID_LOCKER_CODE` | Locker identifier is invalid |

## Assumptions

1. Locker codes are unique and human-readable (e.g., "L-M-001")
2. Package references are unique external identifiers
3. Pickup codes are sufficiently long to prevent guessing (e.g., 8 alphanumeric characters)
4. Grace period is configurable but defaults to 24 hours
5. Charge per day is configurable but defaults to 500 minor units ($5.00)
6. Currency is configurable but defaults to USD
7. No timezone handling needed (all times UTC)
