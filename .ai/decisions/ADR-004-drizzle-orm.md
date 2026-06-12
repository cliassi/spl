# ADR-004: Drizzle ORM

## Status

**Accepted**

## Date

2025-06-12

## Context

We need an ORM or query builder that provides:
- TypeScript support
- SQL migrations
- Good performance
- Explicit query control
- Developer experience

## Decision

Use **Drizzle ORM**.

## Alternatives Considered

### Prisma

**Considered**: Excellent TypeScript support, good migrations. Heavier, more magic, less explicit SQL control.

### TypeORM

**Rejected**: Heavy, complex, configuration-heavy, mixed reputation in community.

### Knex.js

**Considered**: Flexible query builder. Less type safety, no built-in migrations in the same ecosystem.

### Raw SQL

**Considered**: Maximum control. Lose type safety and development velocity.

### Drizzle ORM

**Selected**: TypeScript-first, SQL-like syntax, explicit queries, lightweight, good migrations, excellent performance.

## Positive Consequences

- TypeScript-first with inferred types
- SQL-like syntax (easier to understand and optimize)
- Explicit query construction
- Lightweight bundle size
- drizzle-kit for migrations
- Good performance (close to raw SQL)

## Negative Consequences

- Newer, smaller ecosystem than Prisma
- Fewer features out of the box
- Community resources less extensive

## Risks

| Risk | Mitigation |
|------|------------|
| Maintenance concerns | MIT license, active development, can fork if needed |
| Missing features | Contribute or use raw SQL escape hatches |

## Verification

- Migrations run successfully
- Type inference works correctly
- Query performance is acceptable

## Revisit When

- Drizzle maintenance declines
- Prisma or alternative offers compelling feature
- Performance requires raw SQL migration
