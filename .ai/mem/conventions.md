# Conventions: Smart Package Locker

## Naming Conventions

### Files

- Domain entities: `PascalCase.ts` (e.g., `Locker.ts`)
- Value objects: `PascalCase.ts` (e.g., `Size.ts`)
- Use cases: `PascalCase.ts` (e.g., `StorePackage.ts`)
- Repositories: `PascalCase.ts` (e.g., `LockerRepository.ts`)
- Schemas: `camelCase.schema.ts` (e.g., `storageRequest.schema.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

### Classes/Types

- Entities: `PascalCase` (e.g., `class Locker`)
- Value objects: `PascalCase` (e.g., `class Size`)
- Interfaces: `PascalCase` (e.g., `interface LockerRepository`)
- Enums: `PascalCase` with `PascalCase` values (e.g., `enum PackageStatus { Stored, Retrieved }`)
- Type aliases: `PascalCase` (e.g., `type LockerCode = string`)

### Functions

- camelCase for all functions
- Async functions should start with verb indicating action (e.g., `findAvailableLockers`, `storePackage`)

### Variables

- camelCase for variables
- UPPER_SNAKE_CASE for constants
- Prefix booleans with `is`, `has`, `can`, `should` (e.g., `isAvailable`, `hasPackage`)

### Database

- Table names: plural, snake_case (e.g., `lockers`, `storage_assignments`)
- Column names: snake_case (e.g., `created_at`, `pickup_code_hash`)
- Primary keys: `id` (UUID)
- Timestamps: `created_at`, `updated_at`

## File Organization

### Backend

```
modules/
  <module>/
    domain/
      entities/
      valueObjects/
      policies/
      errors/
    application/
      useCases/
      ports/
    infrastructure/
      repositories/
      services/
    presentation/
      routes/
      schemas/
      mappers/
```

### Frontend

```
features/
  <feature>/
    api/
    components/
    hooks/
    pages/
    schemas/
    types/
```

## Error Handling

### Domain Errors

- Extend from base `DomainError` class
- Include error code and message
- Do not include stack traces in API responses

### API Errors

- Consistent error response shape:
  ```json
  {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "requestId": "...",
    "details": []
  }
  ```
- Use appropriate HTTP status codes
- Do not leak internal error details

## Testing

### Unit Tests

- Test domain logic in isolation
- Mock external dependencies
- Use descriptive test names

### Integration Tests

- Test repository behavior with real database
- Use testcontainers or isolated test database
- Clean up test data between tests

### API Tests

- Test endpoints with full stack
- Verify request/response contracts
- Test error scenarios

### E2E Tests (Playwright)

- Test user flows, not implementation
- Use accessible selectors
- Avoid arbitrary sleeps

## API Conventions

### REST

- Versioned routes: `/api/v1/...`
- Resource-based naming: `GET /lockers`, `POST /packages/storage`
- Use HTTP methods appropriately
- Consistent query parameter patterns

### Validation

- Runtime validation at API boundary using Zod
- Domain validation in use cases
- Client validation for UX (not security)

### Responses

- Success: 200 OK, 201 Created, 204 No Content
- Client errors: 400 Bad Request, 404 Not Found, 409 Conflict
- Server errors: 500 Internal Server Error

## Git Conventions

### Commits

- Conventional Commits format:
  ```
  <type>(<scope>): <description>
  
  [optional body]
  
  [optional footer]
  ```
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Scope: module or component name

### Branches

- `main` — Production-ready code
- `feat/<description>` — Feature branches
- `fix/<description>` — Bug fix branches

## Code Style

### TypeScript

- Enable strict mode
- Explicit return types for public functions
- Prefer `type` over `interface` for simple shapes
- Use discriminated unions for complex state

### Comments

- Prefer self-explanatory code
- Comments for:
  - Non-obvious business rules
  - Security constraints
  - Concurrency behavior
  - Important tradeoffs
- Never comment obvious code

### Security

- Never log sensitive data (pickup codes, hashes)
- Use parameterized queries
- Validate all inputs
- Use constant-time comparison for secrets
- Secure HTTP headers
