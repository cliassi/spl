# ADR-001: Modular Monolith Architecture

## Status

**Accepted**

## Date

2025-06-12

## Context

The Smart Package Locker system requires:
- Transactional consistency for locker allocation
- Clear separation of concerns for maintainability
- Single deployable for operational simplicity
- Future ability to extract services if needed

We considered microservices vs. monolith vs. modular monolith.

## Decision

Use a **modular monolith** architecture.

The backend will be organized into clear modules (lockers, packages, storage, retrieval, storageCharges) with:
- Domain layer: entities, value objects, policies, invariants
- Application layer: use cases, ports
- Infrastructure layer: repositories, external services
- Presentation layer: HTTP routes, validation

Dependencies point inward (domain has no external dependencies).

## Alternatives Considered

### Microservices

**Rejected**: Would introduce network, deployment, consistency, and observability overhead without current value. The domain scope is small and transactional consistency is important.

### Traditional Monolith (without modules)

**Rejected**: Would lead to tangled dependencies and make future extraction difficult.

### Modular Monolith

**Selected**: Provides clear boundaries while maintaining operational simplicity and transactional consistency.

## Positive Consequences

- Simpler deployment and operations
- Database transactions work across modules
- Clear module boundaries enable future extraction
- Easier to test and reason about
- Faster development velocity

## Negative Consequences

- Must enforce module boundaries manually
- Scaling requires scaling entire application
- Technology choices are coupled across modules
- Teams must be disciplined about dependencies

## Risks

| Risk | Mitigation |
|------|------------|
| Module boundaries decay | Code review, architecture tests |
| Performance bottlenecks | Monitoring, profiling, targeted optimization |
| Difficulty extracting services | Document module interfaces, maintain clean boundaries |

## Verification

- Module dependency graph shows inward-pointing arrows
- No import of infrastructure in domain layer
- Integration tests verify cross-module transactions

## Revisit When

- Different modules need independent deployment cycles
- Different modules need different scaling characteristics
- Organizational structure demands team autonomy at service level
- Transactional consistency can be relaxed for specific operations
