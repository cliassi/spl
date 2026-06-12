// Store Package Use Case - Core business operation for storing packages
// Applies allocation policy: smallest suitable available locker

import { Package } from '../../domain/entities/Package.js';
import { StorageAssignment } from '../../domain/entities/StorageAssignment.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { PackageRepository } from '../ports/PackageRepository.js';
import { StorageAssignmentRepository } from '../ports/StorageAssignmentRepository.js';
import { LockerRepository } from '../../../lockers/application/ports/LockerRepository.js';

export interface StorePackageInput {
  reference: string;
  size: Size;
}

export interface StorePackageResult {
  success: true;
  package: Package;
  lockerId: string;
  lockerCode: string;
  pickupCode: string; // Plaintext - shown only once!
}

export interface StorePackageError {
  success: false;
  error: 'DUPLICATE_REFERENCE' | 'NO_SUITABLE_LOCKER' | 'STORAGE_FAILED';
  message: string;
}

export type StorePackageOutput = StorePackageResult | StorePackageError;

export class StorePackageUseCase {
  constructor(
    private readonly packageRepository: PackageRepository,
    private readonly storageAssignmentRepository: StorageAssignmentRepository,
    private readonly lockerRepository: LockerRepository,
    private readonly pickupCodeService: PickupCodeService,
    private readonly generateId: () => string
  ) {}

  /**
   * Execute the store package use case
   * 1. Check for duplicate reference (idempotent)
   * 2. Find smallest suitable available locker
   * 3. Generate pickup code
   * 4. Create package and storage assignment atomically
   * 5. Return plaintext pickup code (shown only once)
   */
  public async execute(input: StorePackageInput): Promise<StorePackageOutput> {
    // Check for duplicate reference
    const existingPackage = await this.packageRepository.findByReference(input.reference);
    if (existingPackage) {
      // Idempotent: if already stored, return existing assignment details
      if (existingPackage.status === 'STORED') {
        const assignment = await this.storageAssignmentRepository.findByPackageId(existingPackage.id);
        if (assignment) {
          const locker = await this.lockerRepository.findById(assignment.lockerId);
          if (locker) {
            return {
              success: false,
              error: 'DUPLICATE_REFERENCE',
              message: `Package with reference '${input.reference}' is already stored in locker ${locker.code}. Pickup code cannot be shown again.`,
            };
          }
        }
      }
      return {
        success: false,
        error: 'DUPLICATE_REFERENCE',
        message: `Package with reference '${input.reference}' already exists with status ${existingPackage.status}`,
      };
    }

    // Find smallest suitable available locker
    const locker = await this.lockerRepository.findSmallestSuitableLocker(input.size);
    if (!locker) {
      return {
        success: false,
        error: 'NO_SUITABLE_LOCKER',
        message: `No suitable locker available for package of size ${input.size.toString()}`,
      };
    }

    // Verify locker is still available (double-check)
    const isAvailable = await this.lockerRepository.isAvailable(locker.id);
    if (!isAvailable) {
      return {
        success: false,
        error: 'NO_SUITABLE_LOCKER',
        message: `Locker ${locker.code} is no longer available`,
      };
    }

    // Generate pickup code
    const { plaintext: pickupCode, hash: pickupCodeHash } = await this.pickupCodeService.generate();

    // Create package
    const pkg = Package.create({
      id: this.generateId(),
      reference: input.reference,
      size: input.size,
    });

    // Mark package as stored
    const storedPackage = pkg.markAsStored();

    // Create storage assignment
    const assignment = StorageAssignment.create({
      id: this.generateId(),
      packageId: storedPackage.id,
      lockerId: locker.id,
      pickupCodeHash,
    });

    // Persist package and assignment atomically
    // Note: In a real implementation, this would be wrapped in a database transaction
    try {
      await this.packageRepository.save(storedPackage);
      await this.storageAssignmentRepository.save(assignment);
    } catch (error) {
      return {
        success: false,
        error: 'STORAGE_FAILED',
        message: `Failed to store package: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Return result with plaintext pickup code (shown only once!)
    return {
      success: true,
      package: storedPackage,
      lockerId: locker.id,
      lockerCode: locker.code,
      pickupCode, // Plaintext - this is the only time it's shown!
    };
  }
}
