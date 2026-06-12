# Architecture Memory: Smart Package Locker

## Architectural Style

**Modular Monolith**

### Why

- Domain and project scope are small
- Locker allocation requires transactional consistency
- Single deployable is easier to operate and review
- Microservices would introduce overhead without current value
- Clear module boundaries preserve future extraction path

### Tradeoffs

**Benefits**:
- Simpler deployment and operations
- Database transactions across modules
- Easier to test and reason about
- Faster development velocity

**Costs**:
- Must enforce module boundaries manually
- Scaling requires scaling entire application
- Technology choices are coupled

### Future Evolution

If business requirements change:
- Clear module boundaries enable extraction
- Transactional outbox pattern can be introduced for cross-module communication
- Database per service can be adopted where needed

## Backend Layers

### Domain Layer

- **Responsibility**: Business logic, entities, value objects, policies, invariants, domain errors
- **Rules**: No HTTP concepts, no database concepts
- **Location**: `apps/api/src/modules/*/domain/`

### Application Layer

- **Responsibility**: Use cases, orchestration, transaction boundaries
- **Rules**: Depends on domain, depends on infrastructure ports
- **Location**: `apps/api/src/modules/*/application/`

### Infrastructure Layer

- **Responsibility**: PostgreSQL, repositories, hashing, clocks, logging
- **Rules**: Implements ports defined in application layer
- **Location**: `apps/api/src/modules/*/infrastructure/`

### Presentation Layer

- **Responsibility**: HTTP routes, validation, request/response mapping
- **Rules**: No business logic, translates HTTP to application commands
- **Location**: `apps/api/src/modules/*/presentation/`

## Dependency Direction

```
Presentation → Application → Domain ← Infrastructure
```

Dependencies point inward. Domain has no dependencies on outer layers.

## Key Interfaces (Ports)

- `LockerRepository`
- `PackageRepository`
- `StorageAssignmentRepository`
- `UnitOfWork` or `TransactionManager`
- `Clock`
- `PickupCodeGenerator`
- `PickupCodeHasher`
- `StorageChargePolicy`

Do not create interfaces for every class. Only at meaningful boundaries.

## Module Organization

```
apps/api/src/modules/
  lockers/       # Locker inventory and availability
  packages/      # Package entity and lifecycle
  storage/       # Storage assignment use cases
  retrieval/     # Retrieval use cases
  storageCharges/ # Charge calculation
```

Each module has:
- `domain/` — Entities, value objects, policies
- `application/` — Use cases, ports
- `infrastructure/` — Repository implementations
- `presentation/` — Routes, controllers

## Frontend Structure

Feature-oriented organization:

```
apps/web/src/features/
  lockers/       # Locker inventory UI
  storage/       # Package storage UI
  retrieval/     # Package retrieval UI
```

Each feature has:
- `api/` — API calls
- `components/` — React components
- `hooks/` — Custom hooks
- `pages/` — Route components
- `schemas/` — Zod schemas
- `types/` — TypeScript types

## Concurrency Approach

### Double Allocation Prevention

1. **Database Constraint**: PostgreSQL partial unique index on `locker_id WHERE retrieved_at IS NULL`
2. **Transaction Strategy**: `SELECT FOR UPDATE` when selecting available locker
3. **Retry Logic**: Application-level retry on constraint violation

### Why Database-Level

- Application-level checks race under concurrent load
- Database constraints are authoritative
- Simpler reasoning about correctness

## Deployment Design

### Local Development

- Docker Compose with PostgreSQL, API, Web
- Hot reload for development
- Volume mounts for code changes

### Production (Documented, Not Implemented)

- **Frontend**: S3 + CloudFront
- **API**: ECS Fargate
- **Database**: RDS PostgreSQL
- **Load Balancing**: Application Load Balancer
- **Secrets**: AWS Secrets Manager
- **Observability**: CloudWatch, OpenTelemetry
- **TLS**: ACM
- **Edge Protection**: AWS WAF

### Why ECS Fargate over EKS

- Simpler operations for single service
- No cluster management overhead
- Pay per use
- Kubernetes is valid but adds complexity without current value
