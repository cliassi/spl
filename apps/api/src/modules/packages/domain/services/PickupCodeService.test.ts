// Unit tests for PickupCodeService
import { describe, it, expect, beforeEach } from 'vitest';
import { PickupCodeService } from './PickupCodeService.js';

describe('PickupCodeService', () => {
  let service: PickupCodeService;

  beforeEach(() => {
    service = new PickupCodeService();
  });

  describe('generate', () => {
    it('should generate a 6-digit numeric code by default', async () => {
      const result = await service.generate();

      expect(result.plaintext).toMatch(/^\d{6}$/);
      expect(parseInt(result.plaintext)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(result.plaintext)).toBeLessThanOrEqual(999999);
    });

    it('should generate different codes on subsequent calls', async () => {
      const result1 = await service.generate();
      const result2 = await service.generate();

      // Extremely unlikely to generate same code twice
      expect(result1.plaintext).not.toBe(result2.plaintext);
    });

    it('should generate a bcrypt hash', async () => {
      const result = await service.generate();

      // bcrypt hashes start with $2b$ (or $2a$, $2y$)
      expect(result.hash).toMatch(/^\$2[aby]\$/);
      // Should contain cost factor
      expect(result.hash).toContain('$12$');
    });

    it('should generate hash that does not contain plaintext', async () => {
      const result = await service.generate();

      // Hash should never contain the plaintext code
      expect(result.hash).not.toContain(result.plaintext);
    });

    it('should support custom code length', async () => {
      const customService = new PickupCodeService({ codeLength: 4 });
      const result = await customService.generate();

      expect(result.plaintext).toMatch(/^\d{4}$/);
    });

    it('should support custom salt rounds', async () => {
      const customService = new PickupCodeService({ saltRounds: 10 });
      const result = await customService.generate();

      expect(result.hash).toContain('$10$');
    });
  });

  describe('verify', () => {
    it('should return true for matching code and hash', async () => {
      const generated = await service.generate();

      const isValid = await service.verify(generated.plaintext, generated.hash);

      expect(isValid).toBe(true);
    });

    it('should return false for non-matching code', async () => {
      const generated = await service.generate();
      const wrongCode = '000000'; // Different from generated

      const isValid = await service.verify(wrongCode, generated.hash);

      expect(isValid).toBe(false);
    });

    it('should return false for completely different code', async () => {
      const generated1 = await service.generate();
      const generated2 = await service.generate();

      const isValid = await service.verify(generated1.plaintext, generated2.hash);

      expect(isValid).toBe(false);
    });

    it('should work consistently with reconstituted service', async () => {
      const generated = await service.generate();

      // Create new service instance
      const newService = new PickupCodeService();
      const isValid = await newService.verify(generated.plaintext, generated.hash);

      expect(isValid).toBe(true);
    });
  });

  describe('security properties', () => {
    it('should use bcrypt for hashing (not MD5/SHA1/SHA256)', async () => {
      const generated = await service.generate();

      // bcrypt hashes have specific format: $2b$<cost>$<salt><hash>
      expect(generated.hash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should generate codes with sufficient entropy', async () => {
      // Generate many codes and check for duplicates
      const codes = new Set<string>();
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const result = await service.generate();
        codes.add(result.plaintext);
      }

      // With 900,000 possible codes, 20 iterations should have no duplicates
      expect(codes.size).toBe(iterations);
    }, 15000);

    it('should generate hashes of consistent length', async () => {
      const results = await Promise.all([
        service.generate(),
        service.generate(),
        service.generate(),
      ]);

      const hashLengths = results.map(r => r.hash.length);
      // bcrypt hashes are typically 60 characters
      expect(hashLengths.every(len => len === 60)).toBe(true);
    });
  });
});
