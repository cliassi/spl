# ADR-009: Integer Minor Units for Money

## Status

**Accepted**

## Date

2025-06-12

## Context

The system calculates extended storage charges. We need to represent monetary amounts accurately.

## Decision

**Use integer minor units (cents) for all monetary amounts.**

- 500 = $5.00
- Never use floating-point arithmetic for money

## Alternatives Considered

### Floating-Point (number)

**Rejected**: Floating-point cannot represent decimal fractions exactly. Rounding errors accumulate.

### BigDecimal/String

**Considered**: More precision than needed for this use case. Additional complexity.

### Integer Minor Units

**Selected**: Exact representation, simple arithmetic, standard practice, database-friendly.

## Positive Consequences

- Exact representation of monetary amounts
- No rounding errors
- Simple integer arithmetic
- Database stores as BIGINT
- Industry best practice

## Negative Consequences

- Must remember to divide by 100 for display
- Currency conversion requires careful handling

## Risks

| Risk | Mitigation |
|------|------------|
| Overflow | Use BIGINT (±9 quintillion), sufficient for this scope |
| Display formatting | Centralize formatting logic, test thoroughly |
| Currency conversion | Out of scope for now; document as future consideration |

## Verification

- Database column is BIGINT
- No floating-point in charge calculations
- Display formatting tested

## Revisit When

- Multi-currency requirements emerge
- Precision requirements exceed cents
- Very large amounts risk overflow
