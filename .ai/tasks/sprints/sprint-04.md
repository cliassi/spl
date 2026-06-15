# Sprint 4: Package Retrieval

**Status**: IN_PROGRESS 🚀  
**Dates**: 2025-06-14 — TBD  
**Goal**: Implement package retrieval flow including pickup code verification, locker release, optional charge calculation, and frontend UI.

## Epic

**SPL-E04**: Package Retrieval Epic

## Tasks

| ID | Summary | Status | Points | Dependencies |
|----|---------|--------|--------|--------------|
| SPL-211 | Retrieve Package Use Case | BACKLOG | 3 | SPL-208 |
| SPL-212 | Pickup Code Verification Service | BACKLOG | 2 | SPL-207 |
| SPL-213 | Package Retrieval API | BACKLOG | 2 | SPL-211, SPL-212 |
| SPL-214 | Charge Calculation Service | BACKLOG | 3 | SPL-211 |
| SPL-215 | Package Retrieval UI | BACKLOG | 3 | SPL-213 |

**Total**: 13 points | **Remaining**: 13 points

## Sprint Goal

Enable recipients to retrieve packages using pickup codes, releasing lockers for reuse and calculating storage charges.

## Definition of Done for Sprint

- [ ] RetrievePackageUseCase with pickup code verification
- [ ] Constant-time code verification with secure error handling
- [ ] Locker release mechanism (mark assignment as retrieved)
- [ ] Charge calculation service (24h grace period + $5/day)
- [ ] POST /api/v1/packages/retrieval endpoint
- [ ] React form for retrieving packages with charge display
- [ ] Comprehensive tests for all scenarios

## Acceptance Criteria by Task

### SPL-211: Retrieve Package Use Case (3 points)
- Accept lockerCode and pickupCode as input
- Find active storage assignment by locker code
- Verify pickup code using constant-time comparison
- Mark package as RETRIEVED with transition validation
- Mark storage assignment as completed (set retrievedAt)
- Release locker for reuse
- Return package details and calculated charges
- Handle errors: invalid code, already retrieved, locker not found

### SPL-212: Pickup Code Verification Service (2 points)
- Extract verification logic from PickupCodeService if needed
- Ensure constant-time comparison to prevent timing attacks
- Generic error messages to prevent information leakage
- Unit tests for verification edge cases

### SPL-213: Package Retrieval API (2 points)
- POST /api/v1/packages/retrieval endpoint
- Request: { lockerCode: string, pickupCode: string }
- Response: { packageId, packageReference, lockerCode, storedAt, retrievedAt, storageCharge }
- Error responses: 400 validation, 401 invalid pickup code (generic), 404 not found
- Security: Never distinguish between wrong code, already retrieved, or non-existent

### SPL-214: Charge Calculation Service (3 points)
- 24-hour grace period (free storage)
- $5.00 per day after grace period (500 minor units)
- Calculate at retrieval time based on storedAt timestamp
- Round up to nearest started day
- Use injected Clock for testability
- Return amount in minor units with currency code

### SPL-215: Package Retrieval UI (3 points)
- Route: /packages/retrieval
- Input fields: locker code, pickup code
- Submit button with loading state
- Success view showing:
  - Package reference
  - Storage duration
  - Charge amount (or "Free" if within grace period)
  - Confirmation message
- Error handling with generic "Invalid pickup code" message

## API Specification

### POST /api/v1/packages/retrieval

**Request**:
```json
{
  "lockerCode": "L-M-001",
  "pickupCode": "123456"
}
```

**Response (200 OK)**:
```json
{
  "packageId": "uuid",
  "packageReference": "PKG-10001",
  "lockerCode": "L-M-001",
  "storedAt": "2025-06-12T15:30:00.000Z",
  "retrievedAt": "2025-06-14T10:15:00.000Z",
  "storageDuration": "1 day, 18 hours",
  "storageCharge": {
    "amountMinorUnits": 500,
    "currency": "USD",
    "displayAmount": "$5.00"
  }
}
```

**Error Response (401)**:
```json
{
  "code": "INVALID_PICKUP_CODE",
  "message": "Invalid pickup code or locker code.",
  "requestId": "uuid"
}
```

## Security Considerations

1. **Generic Errors**: All retrieval failures return same error (no info leakage)
2. **Constant-Time Verification**: Prevent timing attacks on code comparison
3. **No Code Reuse**: Pickup codes cannot be reused after retrieval
4. **Audit Trail**: Storage assignments remain as historical records

## Risks

- Charge calculation edge cases (exactly at grace period boundary)
- Concurrent retrieval attempts (same code used twice)
- Timezone handling (all times UTC)

## Notes

Completes the core package locker lifecycle: storage → retrieval. After this sprint, the system supports full package management workflow.
