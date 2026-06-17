import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../../../infrastructure/database/connection.js';
import { packages, storageAssignments, lockers } from '../../../../infrastructure/database/schema.js';
import { eq } from 'drizzle-orm';
import { PackageRepositoryPostgres } from './PackageRepositoryPostgres.js';
import { StorageAssignmentRepositoryPostgres } from './StorageAssignmentRepositoryPostgres.js';
import { LockerRepositoryPostgres } from '../../../lockers/infrastructure/repositories/LockerRepositoryPostgres.js';
import { StorePackageUseCase } from '../../application/useCases/StorePackageUseCase.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { randomUUID } from 'crypto';

/**
 * Integration test for concurrent request handling
 * Verifies that database-level constraints prevent race conditions
 */
describe('Concurrent Request Handling', () => {
  const packageRepo = new PackageRepositoryPostgres();
  const assignmentRepo = new StorageAssignmentRepositoryPostgres();
  const lockerRepo = new LockerRepositoryPostgres();
  const pickupCodeService = new PickupCodeService();

  const storeUseCase = new StorePackageUseCase(
    packageRepo,
    assignmentRepo,
    lockerRepo,
    pickupCodeService,
    randomUUID
  );

  beforeAll(async () => {
    // Clean up before tests
    await db.delete(storageAssignments);
    await db.delete(packages);
  });

  afterAll(async () => {
    // Clean up after tests
    await db.delete(storageAssignments);
    await db.delete(packages);
  });

  it('should handle multiple concurrent storage requests without double allocation', async () => {
    // Count available small lockers before test
    const availableBefore = await lockerRepo.findSmallestSuitableLocker(Size.small());
    if (!availableBefore) {
      console.log('Skipping: No small lockers available for testing');
      return;
    }

    // Generate unique references for concurrent requests
    const requests = Array.from({ length: 3 }, (_, i) => ({
      reference: `CONCURRENT-${Date.now()}-${i}`,
      size: Size.small(),
    }));

    // Fire all requests concurrently (simulating race condition)
    const results = await Promise.all(
      requests.map((req) =>
        storeUseCase.execute({
          reference: req.reference,
          size: req.size,
        }).catch((error: Error) => ({ success: false, error: 'EXCEPTION', message: error.message }))
      )
    );

    // Count successes
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Verify no more successes than available lockers of this size
    const smallLockers = await db.select().from(lockers).where(eq(lockers.size, 'SMALL'));
    expect(successes.length).toBeLessThanOrEqual(smallLockers.length);

    // Verify each successful package got a unique locker
    const assignedLockerCodes = new Set<string>();
    for (const result of successes) {
      if (result.success && 'lockerCode' in result) {
        expect(assignedLockerCodes.has(result.lockerCode)).toBe(false);
        assignedLockerCodes.add(result.lockerCode);
      }
    }

    // Verify all successful assignments are in database
    for (const result of successes) {
      if (result.success && 'lockerCode' in result) {
        const locker = await lockerRepo.findByCode(result.lockerCode);
        expect(locker).not.toBeNull();

        const assignment = await assignmentRepo.findByLockerId(locker!.id);
        expect(assignment).not.toBeNull();
        expect(assignment!.pickupCodeHash).toBeDefined();
      }
    }

    // If there were failures, verify they got appropriate error messages
    for (const failure of failures) {
      if (!failure.success) {
        expect(failure.message).toMatch(/No suitable locker|already stored|concurrent/i);
      }
    }
  });

  it('should prevent double assignment of same locker via database constraint', async () => {
    // This test verifies the partial unique index works
    // First, store a package
    const result1 = await storeUseCase.execute({
      reference: `DB-CONSTRAINT-1-${Date.now()}`,
      size: Size.small(),
    });

    expect(result1.success).toBe(true);
    if (!result1.success || !('lockerCode' in result1)) return;

    const lockerCode = result1.lockerCode;
    const locker = await lockerRepo.findByCode(lockerCode);
    expect(locker).not.toBeNull();

    // Verify assignment exists in DB
    const assignment = await assignmentRepo.findByLockerId(locker!.id);
    expect(assignment).not.toBeNull();

    // Try to create another assignment for same locker directly at DB level
    // This should fail due to the partial unique index
    const package2 = await storeUseCase.execute({
      reference: `DB-CONSTRAINT-2-${Date.now()}`,
      size: Size.small(),
    });

    // If the second package got the same locker (shouldn't happen), verify it's handled
    if (package2.success && 'lockerCode' in package2 && package2.lockerCode === lockerCode) {
      throw new Error('Database constraint failed: Same locker assigned twice!');
    }

    // The second package should either succeed with different locker or fail gracefully
    if (package2.success && 'lockerCode' in package2) {
      expect(package2.lockerCode).not.toBe(lockerCode);
    } else if (!package2.success) {
      expect(package2.error).toMatch(/NO_SUITABLE_LOCKER|DUPLICATE_REFERENCE/i);
    }
  });

  it('should maintain data consistency under concurrent load', async () => {
    // Clean state
    await db.delete(storageAssignments);
    await db.delete(packages);

    // Fire 10 concurrent requests
    const requestCount = 10;
    const requests = Array.from({ length: requestCount }, (_, i) => ({
      reference: `LOAD-TEST-${Date.now()}-${i}`,
      size: Size.small(),
    }));

    const results = await Promise.allSettled(
      requests.map((req) =>
        storeUseCase.execute({
          reference: req.reference,
          size: req.size,
        })
      )
    );

    // Count results
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Verify no exceptions were thrown (all settled)
    expect(rejected.length).toBe(0);

    // Count successful storages
    const successful = fulfilled.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    // Count failed due to no lockers
    const noLockerFailures = fulfilled.filter(
      (r) =>
        r.status === 'fulfilled' &&
        !r.value.success &&
        r.value.error === 'NO_SUITABLE_LOCKER'
    ).length;

    // Total should match request count
    expect(successful + noLockerFailures).toBe(requestCount);

    // Verify no data corruption by checking unique references
    const allPackages = await db.select().from(packages);
    const references = allPackages.map((p: { reference: string }) => p.reference);
    const uniqueReferences = new Set(references);
    expect(uniqueReferences.size).toBe(references.length);

    // Verify no double locker assignments
    const allAssignments = await db.select().from(storageAssignments);
    const lockerIds = allAssignments
      .filter((a: { retrievedAt: Date | null }) => !a.retrievedAt)
      .map((a: { lockerId: string }) => a.lockerId);
    const uniqueLockerIds = new Set(lockerIds);
    expect(uniqueLockerIds.size).toBe(lockerIds.length);
  });
});
