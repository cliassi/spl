---
trigger: glob
globs: "apps/api/**/*.{ts,tsx}"
---

# Backend Rules

- Respect domain/application/infrastructure/presentation boundaries
- Dependencies point inward
- No Fastify types in domain or application code
- No ORM models outside infrastructure
- Map domain errors to HTTP responses in presentation
- Use transactions for storage and retrieval
- Never log pickup codes or hashes
- Use repository ports only at meaningful boundaries
- Keep allocation deterministic
- Business rules must have unit tests
- Database correctness must have integration tests
