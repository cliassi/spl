# ADR-008: Injected Clock for Time-Dependent Logic

## Status

**Accepted**

## Date

2025-06-12

## Context

The system has time-dependent business logic: storage charges begin after a grace period. We need to test this without relying on system time.

## Decision

**Inject a Clock abstraction for all time-dependent domain logic.**

Never use `new Date()` or `Date.now()` directly in domain code.

## Alternatives Considered

### System Time Directly

**Rejected**: Impossible to test time-dependent logic deterministically. Tests would be flaky and slow (require waiting).

### Test Doubles with Monkey Patching

**Rejected**: Brittle, global state manipulation, doesn't work with all test runners.

### Injected Clock

**Selected**: Explicit dependency, easy to mock in tests, clear intent, enables time travel testing.

## Positive Consequences

- Deterministic tests for time-dependent logic
- Time can be "frozen" or "travelled" in tests
- Clear contract for time dependency
- Production clock is simple wrapper around Date

## Negative Consequences

- Additional parameter to pass through layers
- Slight complexity increase

## Risks

| Risk | Mitigation |
|------|------------|
| Clock not injected everywhere | Code review, lint rules |
| Test clock doesn't match production | Keep production clock simple, well-tested |

## Verification

- No `new Date()` in domain layer
- Storage charge tests use fixed clock times
- Tests cover boundary conditions

## Revisit When

- Framework provides better approach
- Testing requirements change
