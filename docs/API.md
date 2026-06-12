# API Documentation

## Overview

This document describes the REST API for the Smart Package Locker Management System.

- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **Version**: v1

## Common Patterns

### Request Correlation

All requests should include a `X-Request-ID` header. If not provided, the server generates one.

```
X-Request-ID: <uuid>
```

The same ID is returned in the response and included in error responses.

### Error Response Format

All errors follow a consistent format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "requestId": "<uuid>",
  "details": []
}
```

**Error Codes**:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_PICKUP_CODE` | 401 | Invalid or expired pickup code |
| `NOT_FOUND` | 404 | Resource not found |
| `NO_SUITABLE_LOCKER` | 409 | No locker available for package size |
| `PACKAGE_ALREADY_RETRIEVED` | 409 | Package already retrieved |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

**Security Note**: Retrieval errors return generic `INVALID_PICKUP_CODE` to prevent information leakage.

### Date Format

All timestamps are ISO 8601 format in UTC:

```
2025-06-12T15:30:00.000Z
```

## Endpoints

### Health and Readiness

#### GET /health

Returns basic health status.

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-12T15:30:00.000Z"
}
```

**Status Codes**:
- `200 OK` — Service is healthy

---

#### GET /ready

Returns readiness status including database connectivity.

**Response**:

```json
{
  "status": "ready",
  "checks": {
    "database": "connected",
    "timestamp": "2025-06-12T15:30:00.000Z"
  }
}
```

**Status Codes**:
- `200 OK` — Service is ready to accept traffic
- `503 Service Unavailable` — Service not ready (database down, etc.)

---

### Lockers

#### GET /api/v1/lockers

List all lockers with their availability status.

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `size` | string | Filter by size: `SMALL`, `MEDIUM`, `LARGE` |
| `available` | boolean | Filter by availability: `true`, `false` |

**Response**:

```json
{
  "lockers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "L-S-001",
      "size": "SMALL",
      "isAvailable": true,
      "createdAt": "2025-06-01T00:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "code": "L-M-001",
      "size": "MEDIUM",
      "isAvailable": false,
      "createdAt": "2025-06-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "available": 6,
    "bySize": {
      "SMALL": { "total": 4, "available": 3 },
      "MEDIUM": { "total": 3, "available": 2 },
      "LARGE": { "total": 3, "available": 1 }
    }
  }
}
```

**Status Codes**:
- `200 OK` — Success

---

### Packages

#### POST /api/v1/packages/storage

Store a package in an available locker.

**Request Body**:

```json
{
  "reference": "PKG-10001",
  "size": "MEDIUM"
}
```

**Validation Rules**:
- `reference`: Required, unique, 1-50 characters
- `size`: Required, enum [`SMALL`, `MEDIUM`, `LARGE`]

**Response (201 Created)**:

```json
{
  "packageId": "550e8400-e29b-41d4-a716-446655440010",
  "lockerId": "550e8400-e29b-41d4-a716-446655440001",
  "lockerCode": "L-M-001",
  "pickupCode": "A7B9X2K1",
  "storedAt": "2025-06-12T15:30:00.000Z"
}
```

**Important**: The `pickupCode` is returned **exactly once** and never again. The customer must save it.

**Error Responses**:

```json
// 409 Conflict - No suitable locker
{
  "code": "NO_SUITABLE_LOCKER",
  "message": "No suitable locker is currently available for this package size.",
  "requestId": "550e8400-e29b-41d4-a716-446655440999",
  "details": [
    { "field": "size", "value": "LARGE", "message": "No LARGE lockers available" }
  ]
}

// 400 Bad Request - Validation error
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "requestId": "550e8400-e29b-41d4-a716-446655440999",
  "details": [
    { "field": "reference", "message": "Reference is required" }
  ]
}

// 409 Conflict - Duplicate reference
{
  "code": "DUPLICATE_REFERENCE",
  "message": "A package with this reference already exists",
  "requestId": "550e8400-e29b-41d4-a716-446655440999",
  "details": []
}
```

**Status Codes**:
- `201 Created` — Package stored successfully
- `400 Bad Request` — Validation error
- `409 Conflict` — No suitable locker or duplicate reference

---

#### POST /api/v1/packages/retrieval

Retrieve a package using the locker code and pickup code.

**Request Body**:

```json
{
  "lockerCode": "L-M-001",
  "pickupCode": "A7B9X2K1"
}
```

**Validation Rules**:
- `lockerCode`: Required, must exist
- `pickupCode`: Required, 8 characters

**Response (200 OK)**:

```json
{
  "packageId": "550e8400-e29b-41d4-a716-446655440010",
  "packageReference": "PKG-10001",
  "lockerCode": "L-M-001",
  "storedAt": "2025-06-12T15:30:00.000Z",
  "retrievedAt": "2025-06-13T10:15:00.000Z",
  "storageCharge": {
    "amountMinorUnits": 500,
    "currency": "USD",
    "displayAmount": "$5.00"
  }
}
```

**Error Responses**:

```json
// 401 Unauthorized - Invalid pickup code (generic for security)
{
  "code": "INVALID_PICKUP_CODE",
  "message": "Invalid pickup code or locker code.",
  "requestId": "550e8400-e29b-41d4-a716-446655440999",
  "details": []
}
```

**Security Note**: The error is intentionally generic to prevent:
- Determining if a locker code is valid
- Determining if a package exists
- Determining if a pickup code was previously valid

**Status Codes**:
- `200 OK` — Package retrieved successfully
- `400 Bad Request` — Validation error
- `401 Unauthorized` — Invalid pickup code or locker code

---

#### GET /api/v1/packages/:id

Get package details by ID.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Package identifier |

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "reference": "PKG-10001",
  "size": "MEDIUM",
  "status": "RETRIEVED",
  "storedAt": "2025-06-12T15:30:00.000Z",
  "retrievedAt": "2025-06-13T10:15:00.000Z",
  "locker": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "code": "L-M-001",
    "size": "MEDIUM"
  },
  "storageCharge": {
    "amountMinorUnits": 500,
    "currency": "USD",
    "displayAmount": "$5.00"
  }
}
```

**Status Codes**:
- `200 OK` — Success
- `404 Not Found` — Package not found

---

## API Flow Examples

### Complete Storage and Retrieval Flow

#### 1. List Available Lockers

**Request**:
```bash
GET /api/v1/lockers?available=true
```

**Response**:
```json
{
  "lockers": [
    { "id": "...", "code": "L-S-001", "size": "SMALL", "isAvailable": true },
    { "id": "...", "code": "L-M-001", "size": "MEDIUM", "isAvailable": true }
  ],
  "meta": { "total": 10, "available": 6 }
}
```

#### 2. Store a Package

**Request**:
```bash
POST /api/v1/packages/storage
Content-Type: application/json

{
  "reference": "PKG-10001",
  "size": "MEDIUM"
}
```

**Response**:
```json
{
  "packageId": "...",
  "lockerId": "...",
  "lockerCode": "L-M-001",
  "pickupCode": "A7B9X2K1",
  "storedAt": "2025-06-12T15:30:00.000Z"
}
```

**Important**: Save the `pickupCode` — it won't be shown again.

#### 3. Retrieve the Package

**Request**:
```bash
POST /api/v1/packages/retrieval
Content-Type: application/json

{
  "lockerCode": "L-M-001",
  "pickupCode": "A7B9X2K1"
}
```

**Response**:
```json
{
  "packageId": "...",
  "packageReference": "PKG-10001",
  "lockerCode": "L-M-001",
  "storedAt": "2025-06-12T15:30:00.000Z",
  "retrievedAt": "2025-06-13T10:15:00.000Z",
  "storageCharge": {
    "amountMinorUnits": 500,
    "currency": "USD",
    "displayAmount": "$5.00"
  }
}
```

#### 4. Verify Locker is Available Again

**Request**:
```bash
GET /api/v1/lockers?code=L-M-001
```

**Response**:
```json
{
  "lockers": [
    { "id": "...", "code": "L-M-001", "size": "MEDIUM", "isAvailable": true }
  ],
  "meta": { "total": 1, "available": 1 }
}
```

---

## Rate Limiting

**Not Implemented** — Rate limiting is a documented production requirement.

For production deployment, consider:
- Per-IP rate limiting on storage endpoints
- Per-locker rate limiting on retrieval attempts
- Exponential backoff for failed retrieval attempts

---

## Security Considerations

1. **Pickup Codes**: Never logged, never returned after initial storage
2. **Pickup Code Hashes**: Never logged
3. **Error Messages**: Generic for retrieval failures
4. **Input Validation**: Strict validation at API boundary
5. **Parameterized Queries**: All database access uses parameterized queries
6. **CORS**: Configure appropriately for production
7. **TLS**: Required for production (provided by load balancer)

---

## Versioning

The API is versioned in the URL path (`/api/v1/`). Future versions will use `/api/v2/`, etc.

Breaking changes (requiring new version):
- Removing or renaming fields
- Changing field types
- Removing endpoints
- Changing authentication requirements

Non-breaking changes (same version):
- Adding new fields
- Adding new endpoints
- Adding new query parameters
- Adding new error codes
