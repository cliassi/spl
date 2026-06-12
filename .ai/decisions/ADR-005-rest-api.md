# ADR-005: REST API Design

## Status

**Accepted**

## Date

2025-06-12

## Context

We need to choose an API style for the frontend-backend communication.

## Decision

Use **REST** with versioned endpoints (`/api/v1/...`).

## Alternatives Considered

### GraphQL

**Rejected**: Adds complexity without benefit for this domain. Simple CRUD operations with well-defined relationships. No need for flexible querying or aggregation.

### gRPC

**Rejected**: Requires protobuf definitions, HTTP/2 considerations, more complexity than needed for web client.

### tRPC

**Considered**: Excellent TypeScript experience. Couples frontend and backend tightly, less suitable for interview demonstration.

### REST

**Selected**: Simple, well-understood, suitable for the domain, easy to demonstrate and explain.

## Positive Consequences

- Widely understood pattern
- Simple caching semantics
- Easy to test and document
- Suitable for interview explanation
- No additional dependencies

## Negative Consequences

- May require multiple round-trips for complex queries (mitigated by targeted endpoints)
- Less type safety between frontend and backend

## Risks

| Risk | Mitigation |
|------|------------|
| Endpoint proliferation | Design resource-oriented endpoints |
| Type drift | Shared contract types in `packages/contracts` |

## Verification

- API tests verify contracts
- Frontend integration works
- Endpoints follow REST conventions

## Revisit When

- Frontend needs flexible querying
- Mobile clients with specific requirements
- Public API for third parties needed
