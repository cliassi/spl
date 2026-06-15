# Manual Testing Guide

This document provides step-by-step manual test cases for the Smart Package Locker system.

## Prerequisites

- API server running on `http://localhost:3000`
- Web app running on `http://localhost:5173`
- PostgreSQL database with seeded lockers

## Quick Health Check

```bash
# Test API health
curl http://localhost:3000/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

## Test Case 1: Store a Small Package (Happy Path)

**Objective:** Verify package storage with smallest suitable locker allocation.

### Steps:
1. Open browser to `http://localhost:5173/packages/store`
2. Enter package reference: `PKG-001`
3. Select size: **SMALL**
4. Click **"Store Package"**

### Expected Results:
- Success message: "Package Stored Successfully!"
- Locker code displayed (format: `L-S-XXX`)
- 6-digit pickup code displayed (e.g., `123456`)
- Warning: "Save your pickup code - it will not be shown again!"

### API Verification:
```bash
curl -X POST http://localhost:3000/api/v1/packages \
  -H "Content-Type: application/json" \
  -d '{"reference":"PKG-001","size":"SMALL"}'

# Expected: 201 Created with lockerCode, pickupCode, packageId
```

---

## Test Case 2: Store Packages of Different Sizes

**Objective:** Verify correct locker size allocation.

### Steps:

| Package | Reference | Size | Expected Locker |
|---------|-----------|------|-----------------|
| 1 | `SMALL-001` | SMALL | `L-S-XXX` |
| 2 | `MEDIUM-001` | MEDIUM | `L-M-XXX` |
| 3 | `LARGE-001` | LARGE | `L-L-XXX` |

### Expected Results:
- Each package gets a locker matching its size
- Small package → Small locker
- Medium package → Medium locker  
- Large package → Large locker

---

## Test Case 3: Retrieve a Package (Happy Path)

**Objective:** Verify successful package retrieval within grace period.

### Prerequisites:
- Package stored with known locker code and pickup code

### Steps:
1. Open browser to `http://localhost:5173/packages/retrieval`
2. Enter locker code (e.g., `L-S-001`)
3. Enter pickup code (e.g., `123456`)
4. Click **"Retrieve Package"**

### Expected Results:
- Success message: "Package Retrieved!"
- Package reference displayed
- Locker code displayed
- Storage duration shown
- Storage charge: **"FREE"** (within 24h grace period)

### API Verification:
```bash
curl -X POST http://localhost:3000/api/v1/packages/retrieval \
  -H "Content-Type: application/json" \
  -d '{"lockerCode":"L-S-001","pickupCode":"123456"}'

# Expected: 200 OK with package details, storageCharge.displayAmount = "FREE"
```

---

## Test Case 4: Duplicate Package Reference

**Objective:** Verify system prevents duplicate package references.

### Steps:
1. Store package with reference: `DUPLICATE-TEST`
2. Wait for success confirmation
3. Click "Store Another Package"
4. Try to store another package with same reference: `DUPLICATE-TEST`

### Expected Results:
- Error message: "Package with reference 'DUPLICATE-TEST' is already stored in locker L-S-XXX. Pickup code cannot be shown again."
- HTTP 409 Conflict

### API Verification:
```bash
# First store (success)
curl -X POST http://localhost:3000/api/v1/packages \
  -H "Content-Type: application/json" \
  -d '{"reference":"DUPLICATE-TEST","size":"SMALL"}'

# Second store (failure)
curl -X POST http://localhost:3000/api/v1/packages \
  -H "Content-Type: application/json" \
  -d '{"reference":"DUPLICATE-TEST","size":"SMALL"}'

# Expected: 409 Conflict
```

---

## Test Case 5: Invalid Pickup Code

**Objective:** Verify security - generic error for invalid codes.

### Steps:
1. Store a package (save locker code and pickup code)
2. Go to retrieval page
3. Enter correct locker code
4. Enter **wrong** pickup code (e.g., `000000`)
5. Click "Retrieve Package"

### Expected Results:
- Generic error: "Invalid pickup code or locker code."
- No indication of which part was wrong (security)
- No package details revealed

### API Verification:
```bash
curl -X POST http://localhost:3000/api/v1/packages/retrieval \
  -H "Content-Type: application/json" \
  -d '{"lockerCode":"L-S-001","pickupCode":"000000"}'

# Expected: 400 Bad Request with code "INVALID_PICKUP_CODE"
```

---

## Test Case 6: Retrieve Already-Retrieved Package

**Objective:** Verify package cannot be retrieved twice.

### Steps:
1. Store a package
2. Retrieve it successfully (save pickup code)
3. Try to retrieve again with same locker code and pickup code

### Expected Results:
- Error: "Invalid pickup code or locker code."
- HTTP 400 (generic error for security)

---

## Test Case 7: Non-Existent Locker Code

**Objective:** Verify security - no information leakage for invalid locker.

### Steps:
1. Go to retrieval page
2. Enter invalid locker code: `L-X-999`
3. Enter any pickup code: `123456`
4. Click "Retrieve Package"

### Expected Results:
- Generic error: "Invalid pickup code or locker code."
- No indication that locker doesn't exist

---

## Test Case 8: Empty Locker (No Package)

**Objective:** Verify error handling for empty locker.

### Prerequisites:
- Identify an empty locker (e.g., check `/api/v1/lockers` for available ones)

### Steps:
1. Go to retrieval page
2. Enter locker code of empty locker
3. Enter any pickup code
4. Click "Retrieve Package"

### Expected Results:
- Generic error: "Invalid pickup code or locker code."

---

## Test Case 9: Storage Charges (Beyond Grace Period)

**Objective:** Verify charge calculation after 24h grace period.

### Note:
This requires manipulating the database to simulate old storage:

```bash
# After storing a package, manually update the assigned_at timestamp:
docker exec spl-postgres-1 psql -U spl -d smart_package_locker \
  -c "UPDATE storage_assignments SET assigned_at = NOW() - INTERVAL '3 days' WHERE package_id = '<package-id>';"
```

### Steps:
1. Store a package
2. Manually age the assignment (see above)
3. Retrieve the package

### Expected Results:
- Storage charge: **$2.00** (2 days × $1/day after 24h grace period)
- Display: "$2.00" or "2.00 USD"

---

## Test Case 10: No Suitable Locker Available

**Objective:** Verify error when all lockers of required size are occupied.

### Prerequisites:
- Fill all small lockers with packages (don't retrieve them)

### Steps:
1. Store packages until all small lockers are full
2. Try to store another small package

### Expected Results:
- Error: "No suitable locker available for package of size SMALL"
- HTTP 422 Unprocessable Entity

---

## Test Case 11: Locker Inventory Display

**Objective:** Verify locker status display on main page.

### Steps:
1. Open browser to `http://localhost:5173/`
2. Observe the locker inventory

### Expected Results:
- All lockers displayed in grid
- Each locker shows: code, size, status
- Available lockers marked differently from occupied
- Statistics shown: "X Available, Y Occupied, Total: Z"

---

## Test Case 12: Input Validation

**Objective:** Verify form validation for invalid inputs.

### Test Scenarios:

| Input | Value | Expected Behavior |
|-------|-------|-------------------|
| Empty reference | "" | Submit button disabled |
| Very long reference | 100+ chars | Error or truncation |
| Invalid locker code format | `INVALID` | Validation error |
| Short pickup code | `123` | Validation error (needs 6 digits) |
| Non-numeric pickup code | `ABC123` | Validation error |

---

## Edge Case 1: Concurrent Storage Attempts

**Objective:** Verify no race conditions on locker allocation.

### Method:
Simulate concurrent requests:
```bash
# Run these simultaneously in separate terminals
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/v1/packages \
    -H "Content-Type: application/json" \
    -d "{\"reference\":\"CONCURRENT-$i\",\"size\":\"SMALL\"}" &
done
wait
```

### Expected Results:
- Exactly 5 packages stored (if 5+ small lockers available)
- No two packages in same locker
- All get unique pickup codes

---

## Edge Case 2: Special Characters in Reference

**Objective:** Verify handling of special characters.

### Test References:
- `PKG-TEST-123`
- `PACKAGE_WITH_UNDERSCORES`
- `package.lowercase`
- `PKG123`
- `Test-Package-001`

### Expected Results:
- All valid references accepted
- Stored exactly as entered (case-sensitive)

---

## Edge Case 3: Unicode/Emoji Handling

**Objective:** Verify system handles unicode.

### Test:
```bash
curl -X POST http://localhost:3000/api/v1/packages \
  -H "Content-Type: application/json" \
  -d '{"reference":"包裹-001-📦","size":"SMALL"}'
```

### Expected Results:
- Package stored successfully OR graceful error
- Database handles unicode properly

---

## Database Verification Commands

### Check all lockers:
```bash
docker exec spl-postgres-1 psql -U spl -d smart_package_locker \
  -c "SELECT code, size FROM lockers ORDER BY code;"
```

### Check storage assignments:
```bash
docker exec spl-postgres-1 psql -U spl -d smart_package_locker \
  -c "SELECT l.code, l.size, sa.pickup_code_hash, sa.retrieved_at 
      FROM lockers l 
      LEFT JOIN storage_assignments sa ON l.id = sa.locker_id 
      ORDER BY l.code;"
```

### Check packages:
```bash
docker exec spl-postgres-1 psql -U spl -d smart_package_locker \
  -c "SELECT reference, size, status, stored_at, retrieved_at FROM packages;"
```

### Reset database (for clean testing):
```bash
docker exec spl-postgres-1 psql -U spl -d smart_package_locker \
  -c "TRUNCATE TABLE storage_assignments, packages RESTART IDENTITY CASCADE;"
```

---

## Summary Checklist

- [ ] Happy path: Store package → Retrieve package (FREE)
- [ ] Size allocation: Small → Small locker, Medium → Medium, Large → Large
- [ ] Duplicate prevention: Same reference rejected
- [ ] Security: Invalid codes show generic error
- [ ] Security: No info leakage on non-existent locker
- [ ] Already retrieved: Second retrieval fails
- [ ] Empty locker: Retrieval fails gracefully
- [ ] Charges: Beyond grace period shows charge
- [ ] Full lockers: No suitable locker error
- [ ] Inventory: Display shows correct counts
- [ ] Validation: Empty/malformed inputs rejected
- [ ] Edge cases: Concurrent, special chars handled
- [ ] Email notifications: Storage confirmation sent
- [ ] Email notifications: Retrieval confirmation sent

---

## Test Case 13: Email Notifications

**Objective:** Verify email notifications are sent for storage and retrieval events.

### Prerequisites:
- SMTP credentials configured (via environment variables or `smtp` file)

### Steps:

#### Test 13A: Verify Email Configuration
```bash
curl http://localhost:3000/api/v1/notifications/verify
```
**Expected:** `{"configured":true,"smtp":{"host":"...","port":465}}`

#### Test 13B: Send Test Verification Email
```bash
curl -X POST http://localhost:3000/api/v1/notifications/verify-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```
**Expected:** `{"success":true,"message":"Verification email sent..."}`
Check inbox for subject: "Smart Package Locker - Email Verification"

#### Test 13C: Send Storage Notification
```bash
curl -X POST http://localhost:3000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com","type":"storage"}'
```
**Expected:** Email with pickup code, locker code, and instructions

#### Test 13D: Send Retrieval Notification
```bash
curl -X POST http://localhost:3000/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com","type":"retrieval"}'
```
**Expected:** Email with retrieval confirmation and storage duration

### Environment Variables:
```bash
export SMTP_HOST=mail.cogent.space
export SMTP_PORT=465
export SMTP_USER=spl@cogent.space
export SMTP_PASS='your-password'
export SMTP_FROM=spl@cogent.space
```

---

## Notes

- **Pickup codes** are 6-digit numbers (100000-999999)
- **Locker codes** follow pattern: `L-{S|M|L}-{001-999}`
- **Grace period** is 24 hours (no charge)
- **Daily charge** is $1.00 after grace period
- **Security** principle: Never reveal if locker exists, package exists, or which part of code is wrong
