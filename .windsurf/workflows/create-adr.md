---
name: Create ADR
description: Record a consequential decision
---

# /create-adr

Record a consequential decision.

## Steps

1. Determine whether the choice is architectural
2. Use SANITY.md instead if it is a small implementation choice
3. Find the next ADR number
4. Record:
   - Status
   - Date
   - Context
   - Decision
   - Alternatives
   - Positive consequences
   - Negative consequences
   - Risks
   - Mitigations
   - Verification
   - Revisit conditions
5. Link the ADR from relevant memory and task records
6. Do not rewrite historical accepted ADRs silently
7. Supersede an ADR explicitly when a decision changes
