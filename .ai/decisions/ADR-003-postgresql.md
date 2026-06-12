# ADR-003: PostgreSQL as Database

## Status

**Accepted**

## Date

2025-06-12

## Context

We need a relational database that provides:
- ACID transactions
- Concurrency control
- JSON support if needed
- Strong consistency for locker allocation
- Widely available in cloud providers

## Decision

Use **PostgreSQL** as the database.

## Alternatives Considered

### MySQL

**Considered**: Widely used, good performance. Slightly less feature-rich for advanced use cases.

### SQLite

**Rejected**: No concurrent write support, not suitable for multi-user scenario.

### MongoDB

**Rejected**: Document model doesn't fit relational nature of the domain. Transaction support is more complex.

### PostgreSQL

**Selected**: Full ACID compliance, excellent concurrency support, advanced features (JSON, arrays), widely supported, open source.

## Positive Consequences

- Strong transactional guarantees
- Excellent concurrency control
- Partial unique indexes (critical for double-allocation prevention)
- `SELECT FOR UPDATE` for row-level locking
- Widely available managed services (RDS, Cloud SQL, etc.)
- JSON support if semi-structured data needed later

## Negative Consequences

- Heavier than SQLite for simple cases
- More complex setup than some alternatives
- Connection management needed

## Risks

| Risk | Mitigation |
|------|------------|
| Connection pool exhaustion | Configure appropriate pool size, monitor |
| Lock contention | Design for short transactions, profile |
| Managed service cost | Document alternatives, optimize instance size |

## Verification

- Concurrent allocation tests pass
- Partial unique index prevents double allocation
- Transaction rollback works as expected

## Revisit When

- Scale exceeds single PostgreSQL instance
- Specific performance characteristics require different database
- Operational costs become prohibitive
