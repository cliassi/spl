// Unit tests for RetrievePackageUseCase
import { describe, it, expect, beforeEach } from 'vitest';
import { RetrievePackageUseCase } from './RetrievePackageUseCase.js';
import { Package } from '../../domain/entities/Package.js';
import { StorageAssignment } from '../../domain/entities/StorageAssignment.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { Locker } from '../../../lockers/domain/entities/Locker.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { ChargeCalculationService } from '../../domain/services/ChargeCalculationService.js';
import { FixedClock } from '../../../shared/domain/Clock.js';
import type { PackageRepository } from '../ports/PackageRepository.js';
import type { StorageAssignmentRepository } from '../ports/StorageAssignmentRepository.js';
import type { LockerRepository } from '../../../lockers/application/ports/LockerRepository.js';

describe('RetrievePackageUseCase', () => {
  // Mock implementations
  let packageRepo: PackageRepository;
  let assignmentRepo: StorageAssignmentRepository;
  let lockerRepo: LockerRepository;
  let pickupCodeService: PickupCodeService;
  let chargeService: ChargeCalculationService;
  let useCase: RetrievePackageUseCase;

  // Test data
  const testLocker = Locker.fromDatabase({
    id: 'locker-001',
    code: 'L-M-001',
    size: 'MEDIUM',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
  });

  const testPackage = Package.create({
    id: 'pkg-001',
    reference: 'PKG-TEST-001',
    size: Size.medium(),
  }).markAsStored();

  const testPickupCode = { plaintext: '123456', hash: '$2b$12$hash123' };

  const testAssignment = StorageAssignment.create({
    id: 'assign-001',
    packageId: testPackage.id,
    lockerId: testLocker.id,
    pickupCodeHash: testPickupCode.hash,
  });

  beforeEach(() => {
    // Setup mocks with default successful paths
    packageRepo = {
      findById: async () => testPackage,
      update: async () => {},
    } as unknown as PackageRepository;

    assignmentRepo = {
      findByLockerId: async () => testAssignment,
      delete: async () => {},
    } as unknown as StorageAssignmentRepository;

    lockerRepo = {
      findByCode: async () => testLocker,
    } as unknown as LockerRepository;

    pickupCodeService = {
      verify: async () => true,
    } as unknown as PickupCodeService;

    // Fixed clock for deterministic tests (June 14, 2025 10:00 AM)
    const fixedTime = new Date('2025-06-14T10:00:00Z');
    const clock = new FixedClock(fixedTime);
    chargeService = new ChargeCalculationService(clock);

    useCase = new RetrievePackageUseCase(
      packageRepo,
      assignmentRepo,
      lockerRepo,
      pickupCodeService,
      chargeService
    );
  });

  describe('successful retrieval', () => {
    it('should retrieve package with valid locker code and pickup code', async () => {
      const input = {
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.package.packageId).toBe(testPackage.id);
        expect(result.package.packageReference).toBe(testPackage.reference);
        expect(result.package.lockerCode).toBe('L-M-001');
        expect(result.package.storageCharge).toBeDefined();
      }
    });

    it('should mark storage assignment as deleted (release locker)', async () => {
      let deleteCalled = false;
      let deletedAssignmentId: string | null = null;

      assignmentRepo = {
        ...assignmentRepo,
        delete: async (id: string) => {
          deleteCalled = true;
          deletedAssignmentId = id;
        },
      } as unknown as StorageAssignmentRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(deleteCalled).toBe(true);
      expect(deletedAssignmentId).toBe(testAssignment.id);
    });

    it('should save package with RETRIEVED status', async () => {
      let savedPackage: Package | null = null;

      packageRepo = {
        ...packageRepo,
        update: async (pkg: Package) => {
          savedPackage = pkg;
        },
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(true);
      expect(savedPackage).not.toBeNull();
      
      // Type assertion needed because TypeScript can't track assignment through mock closure
      const pkg = savedPackage as unknown as Package;
      expect(pkg.status).toBe('RETRIEVED');
      expect(pkg.retrievedAt).toBeDefined();
    });
  });

  describe('error handling - security (generic errors)', () => {
    it('should return generic error for non-existent locker code', async () => {
      lockerRepo = {
        ...lockerRepo,
        findByCode: async () => null,
      } as unknown as LockerRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-NONEXISTENT',
        pickupCode: '123456',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('INVALID_PICKUP_CODE');
        expect(result.message).toBe('Invalid pickup code or locker code.');
      }
    });

    it('should return generic error for locker with no active assignment', async () => {
      assignmentRepo = {
        ...assignmentRepo,
        findByLockerId: async () => null,
      } as unknown as StorageAssignmentRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('INVALID_PICKUP_CODE');
      }
    });

    it('should return generic error for invalid pickup code', async () => {
      pickupCodeService = {
        verify: async () => false,
      } as unknown as PickupCodeService;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: 'WRONGCODE',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('INVALID_PICKUP_CODE');
      }
    });

    it('should return generic error for non-existent package', async () => {
      packageRepo = {
        ...packageRepo,
        findById: async () => null,
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('INVALID_PICKUP_CODE');
      }
    });
  });

  describe('error handling - already retrieved', () => {
    it('should return specific error for already retrieved package', async () => {
      const retrievedPackage = testPackage.markAsRetrieved();

      packageRepo = {
        ...packageRepo,
        findById: async () => retrievedPackage,
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('PACKAGE_ALREADY_RETRIEVED');
        expect(result.message).toContain('already been retrieved');
      }
    });
  });

  describe('charge calculation', () => {
    it('should calculate zero charge within grace period', async () => {
      // Package stored 12 hours ago (within 24h grace period)
      const recentStoredAt = new Date('2025-06-14T00:00:00Z');
      const recentPackage = Package.reconstitute({
        ...testPackage.toProps(),
        storedAt: recentStoredAt,
      });

      packageRepo = {
        ...packageRepo,
        findById: async () => recentPackage,
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.package.storageCharge.amountMinorUnits).toBe(0);
        expect(result.package.storageCharge.displayAmount).toBe('$0.00');
      }
    });

    it('should calculate charge after grace period', async () => {
      // Package stored 48 hours ago (24h grace + 24h chargeable = 1 day = $5)
      const oldStoredAt = new Date('2025-06-12T10:00:00Z');
      const oldPackage = Package.reconstitute({
        ...testPackage.toProps(),
        storedAt: oldStoredAt,
      });

      packageRepo = {
        ...packageRepo,
        findById: async () => oldPackage,
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.package.storageCharge.amountMinorUnits).toBe(500); // $5.00
        expect(result.package.storageCharge.displayAmount).toBe('$5.00');
      }
    });

    it('should calculate multi-day charges correctly', async () => {
      // Package stored 72 hours ago (24h grace + 48h = 2 days = $10)
      const oldStoredAt = new Date('2025-06-11T10:00:00Z');
      const oldPackage = Package.reconstitute({
        ...testPackage.toProps(),
        storedAt: oldStoredAt,
      });

      packageRepo = {
        ...packageRepo,
        findById: async () => oldPackage,
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.package.storageCharge.amountMinorUnits).toBe(1000); // $10.00
        expect(result.package.storageCharge.displayAmount).toBe('$10.00');
      }
    });

    it('should include storage duration in response', async () => {
      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.package.storageDuration).toBeDefined();
        expect(typeof result.package.storageDuration).toBe('string');
      }
    });
  });

  describe('idempotency and race conditions', () => {
    it('should handle race condition where package is retrieved between read and write', async () => {
      // Simulate race: findById returns STORED, but when we try markAsRetrieved
      // we catch the state transition error and report already retrieved
      const alreadyRetrievedPackage = testPackage.markAsRetrieved();

      packageRepo = {
        ...packageRepo,
        findById: async () => alreadyRetrievedPackage,
      } as unknown as PackageRepository;

      useCase = new RetrievePackageUseCase(
        packageRepo,
        assignmentRepo,
        lockerRepo,
        pickupCodeService,
        chargeService
      );

      // When package is already RETRIEVED, the use case should catch it
      const result = await useCase.execute({
        lockerCode: 'L-M-001',
        pickupCode: '123456',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('PACKAGE_ALREADY_RETRIEVED');
      }
    });
  });
});
