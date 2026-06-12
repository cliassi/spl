# ADR-002: Fastify as Web Framework

## Status

**Accepted**

## Date

2025-06-12

## Context

We need a Node.js web framework for the REST API that provides:
- TypeScript support
- Performance
- Plugin ecosystem
- Validation integration
- Developer experience

## Decision

Use **Fastify** as the web framework.

## Alternatives Considered

### Express

**Rejected**: Mature but slower, less modern TypeScript support, callback-based middleware model.

### NestJS

**Rejected**: Too heavy for this project scope. Brings unnecessary abstraction and complexity. Opinionated structure conflicts with our explicit layer decisions.

### Hono

**Considered**: Lightweight, fast, modern. Less mature ecosystem than Fastify.

### Fastify

**Selected**: Fast, TypeScript-friendly, plugin architecture, built-in validation hooks, excellent performance.

## Positive Consequences

- High performance (faster than Express)
- Built-in JSON schema validation
- Plugin architecture for modularity
- Excellent TypeScript support
- Active ecosystem and maintenance
- Built-in request/response logging hooks

## Negative Consequences

- Smaller ecosystem than Express (though still substantial)
- Learning curve for developers familiar only with Express
- Different middleware pattern

## Risks

| Risk | Mitigation |
|------|------------|
| Team unfamiliarity | Documentation, small API surface |
| Plugin compatibility issues | Use well-maintained plugins, pin versions |

## Verification

- API tests pass
- Performance benchmarks meet requirements
- Validation works as expected

## Revisit When

- Team has strong preference for another framework
- Fastify maintenance declines
- Specific features require framework change
