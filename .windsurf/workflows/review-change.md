---
name: Review Change
description: Perform a senior-engineer code review
---

# /review-change

Perform a senior-engineer code review.

## Review Order

1. Requirement correctness
2. Domain invariant violations
3. Security risks
4. Concurrency and transaction risks
5. Data integrity
6. Error handling
7. API contract compatibility
8. Test gaps
9. Maintainability
10. Documentation accuracy

## Reporting

Report findings first, ordered by severity.

Every finding must contain:

- Severity
- File and line
- Problem
- User or system impact
- Recommended correction

Do not manufacture findings merely to populate a review.
