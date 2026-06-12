# Project Memory: Smart Package Locker

## Objective

Build a package-locker management system that demonstrates hands-on engineering, technical leadership, architectural reasoning, testing discipline, security awareness, cloud readiness, responsible AI usage, and clear communication.

## Scope

### Implemented (Levels 1-3)

- Delivery agents store packages
- System allocates suitable lockers
- Customers retrieve packages using pickup codes
- System calculates extended-storage charges
- React frontend
- Node.js/TypeScript backend
- PostgreSQL persistence
- REST APIs
- Unit, integration, API, and Playwright E2E tests
- Docker-based local development
- CI configuration
- Architecture and interview documentation

### Level 4 (via Database Concurrency)

- Database-level concurrency protection
- Tests for concurrent locker allocation
- No unnecessary distributed infrastructure

### Explicitly Out of Scope

- Authentication
- Payment processing
- Kafka/RabbitMQ
- Kubernetes
- Multiple deployable microservices
- Redis
- Complex design system
- Cloud provisioning

## Stack

**Frontend**: React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Vitest, React Testing Library, Playwright

**Backend**: Node.js, TypeScript, Fastify, Zod, PostgreSQL, Drizzle ORM, Vitest, Testcontainers

**Tooling**: pnpm workspaces, ESLint, Prettier, Docker, Docker Compose, GitHub Actions

## Current Status

| Epic | Status |
|------|--------|
| Sprint 1: Foundation | IN_PROGRESS |
| Sprint 2: Locker Inventory | BACKLOG |
| Sprint 3: Package Storage | BACKLOG |
| Sprint 4: Retrieval and Charges | BACKLOG |
| Sprint 5: Concurrency and Reliability | BACKLOG |
| Sprint 6: Delivery Quality | BACKLOG |

## Test Status

No tests implemented yet (foundation phase).

## Risks

1. **Scope creep**: Must resist adding out-of-scope features
2. **AI verification**: Must run all verification commands, not fabricate results
3. **Interview size**: Must keep code explainable in interview context

## Deferred Work

- Authentication (documented as future consideration)
- Message brokers (documented as future consideration)
- Cloud provisioning (documented in ARCHITECTURE.md)
