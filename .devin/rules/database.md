---
trigger: glob
globs: "{database/**,apps/api/src/**/infrastructure/**}"
---

# Database Rules

- Use migrations for schema changes
- Add appropriate constraints and indexes
- Preserve referential integrity
- Use UTC timestamps with time zones
- Explain denormalized state
- Ensure only one active assignment per locker
- Treat the database constraint as the final concurrency safeguard
- Test migrations and concurrent allocation
- Never modify an already-applied migration unless it is explicitly safe and approved
- Seed data must be deterministic and non-sensitive
