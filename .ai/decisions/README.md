# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Smart Package Locker project.

## What is an ADR?

An ADR captures an architectural decision made along with its context and consequences. It provides:

- **Transparency**: Decisions are visible and reviewable
- **Context**: Why the decision was made
- **Alternatives**: What else was considered
- **Consequences**: Tradeoffs and risks
- **Evolution**: When to reconsider

## Format

Each ADR follows this structure:

- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Date**: When decided
- **Context**: Problem and forces
- **Decision**: What was decided
- **Alternatives Considered**: Options evaluated
- **Positive Consequences**: Benefits
- **Negative Consequences**: Costs
- **Risks**: Potential issues
- **Mitigations**: How to address risks
- **Verification**: How to confirm decision works
- **Revisit When**: Conditions for reconsideration

## Index

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | Modular Monolith Architecture | Accepted |
| ADR-002 | Fastify as Web Framework | Accepted |
| ADR-003 | PostgreSQL as Database | Accepted |
| ADR-004 | Drizzle ORM | Accepted |
| ADR-005 | REST API Design | Accepted |
| ADR-006 | Feature-Oriented React Structure | Accepted |
| ADR-007 | Hashed Pickup Codes | Accepted |
| ADR-008 | Injected Clock | Accepted |
| ADR-009 | Integer Minor Units for Money | Accepted |
| ADR-010 | Database-Enforced Locker Allocation | Accepted |
| ADR-011 | In-Process Domain Events | Accepted |

## Adding New ADRs

1. Use format `ADR-NNN-short-title.md`
2. Follow the template structure
3. Update this index
4. Link from relevant code and documentation
