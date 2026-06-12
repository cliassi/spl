---
name: Run Quality Gates
description: Run the project's authoritative checks
---

# /run-quality-gates

Run the project's authoritative checks.

## Steps

1. Inspect package scripts and CI configuration
2. Determine applicable commands
3. Run formatting checks
4. Run linting
5. Run type checking
6. Run unit tests
7. Run integration tests when infrastructure is available
8. Run production builds
9. Run Playwright when the relevant application is runnable
10. Report exact commands and outcomes
11. Do not modify tests merely to hide failures
12. Create bug tasks for failures not resolved within the current task

Do not invent commands if project tooling is not yet present.
