# Smart Package Locker Agent Guide

## Mission

Build a package-locker management system that demonstrates hands-on engineering, technical leadership, architectural reasoning, testing discipline, security awareness, and clear communication for an interview coding challenge.

## Scope

**Implemented**: Challenge Levels 1–3 (storage, allocation, retrieval, charges) plus Level 4 via database-level concurrency protection.

**Explicitly Excluded**: Authentication, payment processing, Kafka, Kubernetes, multiple microservices, Redis, complex design systems, cloud provisioning.

## Technology

**Frontend**: React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Vitest, React Testing Library, Playwright

**Backend**: Node.js, TypeScript, Fastify, Zod, PostgreSQL, Drizzle ORM, Vitest

**Tooling**: pnpm workspaces, ESLint, Prettier, Docker, Docker Compose, GitHub Actions

## Architecture

**Modular Monolith**: Single deployable with clear internal boundaries.

**Layers** (dependencies point inward):
- **Domain**: Entities, value objects, policies, invariants
- **Application**: Use cases, ports, transaction boundaries
- **Infrastructure**: PostgreSQL, repositories, hashing, clocks
- **Presentation**: HTTP routes, validation, request/response mapping

**PostgreSQL** is the consistency boundary for locker allocation.

## Critical Domain Rules

These rules must never be violated:

1. **Smallest Suitable Locker**: Select the smallest available locker that fits the package
2. **Single Occupancy**: One active package per locker maximum
3. **Transactional Operations**: Storage and retrieval must be atomic
4. **Hashed Pickup Codes**: Store only secure hashes, never plaintext
5. **One-Time Code Response**: Plaintext returned exactly once during storage
6. **Injected Clock**: All time-dependent logic uses an injected Clock
7. **Integer Money**: Use minor units (cents), never floating-point
8. **Database Concurrency**: PostgreSQL partial unique index prevents double allocation

## Engineering Principles

- Prefer clarity over abstraction
- Add interfaces only at meaningful boundaries
- Avoid speculative infrastructure
- Keep HTTP and database concerns outside the domain layer
- Never expose database records directly as API responses
- Tests must focus on behavior and risk, not implementation details
- Comments explain why, not what

## Required Workflow

1. Read `.ai/NEXT.md`
2. Read the active task from `.ai/tasks/active.json`
3. Inspect relevant code and decisions
4. State intended changes and verification method
5. Implement incrementally
6. Run appropriate checks
7. Update governance records

## Verification

Package scripts will be added during tooling setup. Until then, verify by:
- File existence and structure
- JSON schema validation (`jq empty file.json`)
- Content completeness against acceptance criteria

## Definition of Done

A task is complete when:
- Acceptance criteria satisfied
- Tests pass
- Type checking passes
- Linting passes
- Documentation updated
- Evidence recorded
- Task moved to `completed.json`
- `.ai/NEXT.md` identifies next action

See `.ai/rules.md` for full prohibitions and `.ai/tasks/README.md` for task management details.

## Directory Guidance

| Location | Purpose |
|----------|---------|
| `.devin/rules/` | Scoped behavioral constraints |
| `.windsurf/workflows/` | Manually invoked procedures |
| `.windsurf/skills/` | Reserved for complex reusable procedures (currently unused) |
| `.ai/NEXT.md` | Current state and next action |
| `.ai/tasks/` | Task management (canonical source) |
| `.ai/decisions/` | Architecture Decision Records |
| `.ai/mem/` | Project memory |
| `docs/` | Human-facing documentation |

## Rules, Workflows, and Skills

- **Rules** define persistent constraints loaded by file patterns
- **Workflows** define manually invoked procedures via slash commands
- **Skills** are reserved for procedures requiring supporting scripts or templates
- This project currently has no demonstrated need for custom skills

## Safety

- Never record secrets or credentials
- Never fabricate command or test results
- Never store hidden chain-of-thought
- Preserve unrelated user changes
- Do not perform destructive Git operations without explicit permission

## Continuing Work

To resume: read `.ai/NEXT.md`, check active task, inspect repository, proceed.
