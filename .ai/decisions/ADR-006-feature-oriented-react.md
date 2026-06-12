# ADR-006: Feature-Oriented React Structure

## Status

**Accepted**

## Date

2025-06-12

## Context

We need to organize the React frontend code for maintainability and scalability.

## Decision

Use **feature-oriented folder structure**.

```
features/
  lockers/
    api/
    components/
    hooks/
    pages/
    schemas/
    types/
```

## Alternatives Considered

### Type-Oriented (folders by file type)

```
components/
hooks/
pages/
api/
```

**Rejected**: Scatters related code across folders, harder to understand features, doesn't scale well.

### Domain-Driven (Bounded Contexts)

**Considered**: Similar to feature-oriented but more formal. May be overkill for this scope.

### Feature-Oriented

**Selected**: Co-locates related code, clear boundaries, easy to understand, scales well, clear for interview demonstration.

## Positive Consequences

- Co-located related code
- Clear feature boundaries
- Easy to understand and navigate
- Scales with additional features
- Easy to delete features

## Negative Consequences

- Some code duplication across features (acceptable tradeoff)
- Shared code location requires discipline

## Risks

| Risk | Mitigation |
|------|------------|
| Shared code proliferation | `shared/` folder for truly cross-cutting concerns |
| Feature bloat | Regular refactoring, clear feature boundaries |

## Verification

- Code review confirms feature cohesion
- Navigation is intuitive
- Cross-feature dependencies are minimal

## Revisit When

- Features become too large
- Cross-cutting concerns dominate
- Team structure suggests different organization
