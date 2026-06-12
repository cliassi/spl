# ADR-011: In-Process Domain Events

## Status

**Accepted**

## Date

2025-06-12

## Context

We need to represent important domain events (PackageStored, PackageRetrieved, StorageChargeCalculated) for potential future use while keeping the system simple.

## Decision

**Use in-process domain events initially.**

No message broker (Kafka, RabbitMQ). Events are handled synchronously within the same process.

## Alternatives Considered

### Out-of-Process Events with Message Broker

**Rejected**: Adds infrastructure complexity without current need. No separate services consuming events yet.

### No Events (Direct Method Calls)

**Considered**: Simpler but less explicit about important domain occurrences. Harder to add cross-cutting concerns later.

### In-Process Events

**Selected**: Explicit about domain events, enables future extraction, simple, no additional infrastructure.

## Positive Consequences

- Explicit domain events
- Can add handlers for cross-cutting concerns (logging, metrics)
- Future path to out-of-process if needed
- Simple to implement and test

## Negative Consequences

- Events are lost on process crash (acceptable for now)
- Synchronous handlers block request
- No event durability

## Risks

| Risk | Mitigation |
|------|------------|
| Event loss | Document as known limitation, acceptable for current scope |
| Handler failure | Handle errors in event handlers, don't fail request |
| Future migration | Document transactional outbox pattern for future |

## Verification

- Domain events are raised and handled
- Event structure is clear
- Documentation explains future evolution

## Revisit When

- Events must survive process crashes
- Separate services need to consume events
- Event-driven architecture becomes requirement

## Future Evolution

When durable events are needed:

1. Add `events` table for transactional outbox
2. Write event to `events` table in same transaction as business data
3. Separate process polls `events` table and publishes to message broker
4. Consumers receive events from broker

This is the transactional outbox pattern.
