// Unit tests for StorePackageUseCase
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorePackageUseCase, StorePackageInput } from './StorePackageUseCase.js';
import { PackageRepository } from '../ports/PackageRepository.js';
import { StorageAssignmentRepository } from '../ports/StorageAssignmentRepository.js';
import { LockerRepository } from '../../../lockers/application/ports/LockerRepository.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { Package } from '../../domain/entities/Package.js';
import { PackageStatus } from '../../domain/enums/PackageStatus.js';
import { StorageAssignment } from '../../domain/entities/StorageAssignment.js';
import { Locker } from '../../../lockers/domain/entities/Locker.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';

describe('StorePackageUseCase', () => {
  let useCase: StorePackageUseCase;
  let mockPackageRepo: PackageRepository;
  let mockStorageAssignmentRepo: StorageAssignmentRepository;
  let mockLockerRepo: LockerRepository;
  let mockPickupCodeService: PickupCodeService;
  let idCounter: number;

  beforeEach(() => {
    idCounter = 0;
    const generateId = () => `id-${++idCounter}`;

    // Create mock implementations
    mockPackageRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByReference: vi.fn(),
      existsByReference: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    mockStorageAssignmentRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByPackageId: vi.fn(),
      findByLockerId: vi.fn(),
      hasActiveAssignmentForLocker: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    mockLockerRepo = {
      findAll: vi.fn(),
      findAvailableLockers: vi.fn(),
      findById: vi.fn(),
      findByCode: vi.fn(),
      isAvailable: vi.fn(),
      findSmallestSuitableLocker: vi.fn(),
    };

    mockPickupCodeService = {
      generate: vi.fn().mockResolvedValue({
        plaintext: '123456',
        hash: '$2b$12$hash',
      }),
      verify: vi.fn(),
    } as unknown as PickupCodeService;

    useCase = new StorePackageUseCase(
      mockPackageRepo,
      mockStorageAssignmentRepo,
      mockLockerRepo,
      mockPickupCodeService,
      generateId
    );
  });

  describe('successful storage', () => {
    it('should store a package in the smallest suitable locker', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-S-001',
        size: 'SMALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(locker);
      vi.mocked(mockLockerRepo.isAvailable).mockResolvedValue(true);

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.lockerCode).toBe('L-S-001');
        expect(result.pickupCode).toBe('123456');
        expect(result.package.status).toBe(PackageStatus.STORED);
        expect(result.package.reference).toBe('PKG-001');
      }
    });

    it('should call pickup code service to generate code', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-S-001',
        size: 'SMALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(locker);
      vi.mocked(mockLockerRepo.isAvailable).mockResolvedValue(true);

      await useCase.execute(input);

      expect(mockPickupCodeService.generate).toHaveBeenCalled();
    });

    it('should save package and storage assignment', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-S-001',
        size: 'SMALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(locker);
      vi.mocked(mockLockerRepo.isAvailable).mockResolvedValue(true);

      await useCase.execute(input);

      expect(mockPackageRepo.save).toHaveBeenCalled();
      expect(mockStorageAssignmentRepo.save).toHaveBeenCalled();
    });

    it('should return plaintext pickup code exactly once', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-S-001',
        size: 'SMALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(locker);
      vi.mocked(mockLockerRepo.isAvailable).mockResolvedValue(true);
      vi.mocked(mockPickupCodeService.generate).mockResolvedValue({
        plaintext: '987654',
        hash: '$2b$12$hash',
      });

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.pickupCode).toBe('987654');
      }
    });
  });

  describe('duplicate reference handling', () => {
    it('should return error for duplicate reference', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const existingPackage = Package.reconstitute({
        id: 'existing-id',
        reference: 'PKG-001',
        size: Size.small(),
        status: PackageStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(existingPackage);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DUPLICATE_REFERENCE');
      }
    });

    it('should return specific error for already stored package', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const existingPackage = Package.reconstitute({
        id: 'existing-id',
        reference: 'PKG-001',
        size: Size.small(),
        status: PackageStatus.STORED,
        storedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const assignment = StorageAssignment.reconstitute({
        id: 'assignment-id',
        packageId: 'existing-id',
        lockerId: 'locker-1',
        pickupCodeHash: '$2b$12$hash',
        createdAt: new Date(),
      });

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-S-001',
        size: 'SMALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(existingPackage);
      vi.mocked(mockStorageAssignmentRepo.findByPackageId).mockResolvedValue(assignment);
      vi.mocked(mockLockerRepo.findById).mockResolvedValue(locker);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DUPLICATE_REFERENCE');
        expect(result.message).toContain('already stored');
        expect(result.message).toContain('cannot be shown again');
      }
    });
  });

  describe('no suitable locker handling', () => {
    it('should return error when no suitable locker available', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.large(),
      };

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NO_SUITABLE_LOCKER');
      }
    });

    it('should return error when locker becomes unavailable during check', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.small(),
      };

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-S-001',
        size: 'SMALL',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(locker);
      vi.mocked(mockLockerRepo.isAvailable).mockResolvedValue(false); // Race condition!

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NO_SUITABLE_LOCKER');
      }
    });
  });

  describe('allocation policy', () => {
    it('should use findSmallestSuitableLocker for allocation', async () => {
      const input: StorePackageInput = {
        reference: 'PKG-001',
        size: Size.medium(),
      };

      const locker = Locker.fromDatabase({
        id: 'locker-1',
        code: 'L-M-001',
        size: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockPackageRepo.findByReference).mockResolvedValue(null);
      vi.mocked(mockLockerRepo.findSmallestSuitableLocker).mockResolvedValue(locker);
      vi.mocked(mockLockerRepo.isAvailable).mockResolvedValue(true);

      await useCase.execute(input);

      expect(mockLockerRepo.findSmallestSuitableLocker).toHaveBeenCalledWith(Size.medium());
    });
  });
});
