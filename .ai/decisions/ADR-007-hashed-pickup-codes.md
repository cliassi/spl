# ADR-007: Hashed Pickup Codes

## Status

**Accepted**

## Date

2025-06-12

## Context

Pickup codes are secrets used for package retrieval. We need to store them securely while still being able to verify them.

## Decision

**Store only secure hashes of pickup codes, never the plaintext.**

Return the plaintext code exactly once during storage, then discard it. Verification uses constant-time hash comparison.

## Alternatives Considered

### Plaintext Storage

**Rejected**: Database compromise exposes all codes. Violates security best practices.

### Encrypted Storage

**Considered**: Allows decryption if needed. Unnecessary complexity, key management overhead. Hashing is sufficient.

### Hashed Storage

**Selected**: One-way function, no recovery possible, secure even if database is compromised.

## Positive Consequences

- Database compromise doesn't expose usable codes
- Follows security best practices
- Simple to implement with bcrypt or Argon2
- Constant-time comparison prevents timing attacks

## Negative Consequences

- Code cannot be recovered if user forgets it
- Must communicate this limitation clearly in UI

## Risks

| Risk | Mitigation |
|------|------------|
| Hash algorithm vulnerabilities | Use well-vetted algorithms (Argon2id preferred, bcrypt acceptable) |
| Timing attacks | Use constant-time comparison |
| Brute force | Sufficient code entropy (8+ alphanumeric = 2.8e14 combinations) |

## Verification

- Database contains only hashes, no plaintext
- Verification uses constant-time comparison
- Code returned exactly once
- Logs contain no codes or hashes

## Revisit When

- Security requirements change
- New hashing algorithms become standard
- Different security model needed (e.g., time-limited codes)
