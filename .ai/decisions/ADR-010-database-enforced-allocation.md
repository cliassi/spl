# ADR-010: Database-Enforced Locker Allocation

## Status

**Accepted**

## Date

2025-06-12

## Context

Level 4 of the challenge requires preventing concurrent requests from allocating the same locker. We need a reliable concurrency strategy.

## Decision

**Use PostgreSQL partial unique index and row-level locking for concurrent allocation protection.**

```sql
CREATE UNIQUE INDEX idx_unique_active_assignment
ON storage_assignments (locker_id)
WHERE retrieved_at IS NULL;
```

Use `SELECT FOR UPDATE` when selecting an available locker.

## Alternatives Considered

### Application-Level Checks Only

**Rejected**: Race conditions possible. Two concurrent requests can both pass the check and both insert.

### Distributed Locks (Redis)

**Rejected**: Adds infrastructure complexity (Redis). Database solution is sufficient.

### Optimistic Locking (Version Numbers)

**Considered**: Requires retry logic, more complex error handling. Unique index is simpler.

### Database Constraint

**Selected**: Authoritative, simple, no additional infrastructure, guaranteed correct.

## Positive Consequences

- Guaranteed no double allocation
- No additional infrastructure
- Simple to reason about
- Database is authoritative

## Negative Consequences

- Constraint violation requires handling
- Row locking can reduce concurrency (acceptable for this use case)

## Risks

| Risk | Mitigation |
|------|------------|
| Deadlocks | Always acquire locks in consistent order |
| Performance under load | Short transactions, monitor lock contention |
| Constraint violation handling | Retry with exponential backoff |

## Verification

- Concurrent allocation tests verify no double allocation
- Partial unique index exists in database
- `SELECT FOR UPDATE` used in allocation

## Revisit When

- Scale exceeds single database
- Allocation contention becomes bottleneck
- Distributed system architecture adopted
