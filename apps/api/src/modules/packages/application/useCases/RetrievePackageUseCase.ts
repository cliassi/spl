// Retrieve Package Use Case - Core business operation for retrieving packages
// Verifies pickup code, releases locker, calculates charges

import { Package } from '../../domain/entities/Package.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { ChargeCalculationService } from '../../domain/services/ChargeCalculationService.js';
import { PackageRepository } from '../ports/PackageRepository.js';
import { StorageAssignmentRepository } from '../ports/StorageAssignmentRepository.js';
import { LockerRepository } from '../../../lockers/application/ports/LockerRepository.js';

export interface RetrievePackageInput {
  lockerCode: string;
  pickupCode: string;
}

export interface RetrievedPackageInfo {
  packageId: string;
  packageReference: string;
  lockerCode: string;
  storedAt: Date;
  retrievedAt: Date;
  storageDuration: string;
  storageCharge: {
    amountMinorUnits: number;
    currency: string;
    displayAmount: string;
  };
}

export interface RetrievePackageSuccess {
  success: true;
  package: RetrievedPackageInfo;
}

export interface RetrievePackageError {
  success: false;
  error: 'INVALID_PICKUP_CODE' | 'PACKAGE_ALREADY_RETRIEVED' | 'LOCKER_NOT_FOUND';
  message: string;
}

export type RetrievePackageOutput = RetrievePackageSuccess | RetrievePackageError;

export class RetrievePackageUseCase {
  constructor(
    private readonly packageRepository: PackageRepository,
    private readonly storageAssignmentRepository: StorageAssignmentRepository,
    private readonly lockerRepository: LockerRepository,
    private readonly pickupCodeService: PickupCodeService,
    private readonly chargeCalculationService: ChargeCalculationService
  ) {}

  /**
   * Execute the retrieve package use case
   * 1. Find locker by code
   * 2. Find active storage assignment for locker
   * 3. Get package and verify it's in STORED state
   * 4. Verify pickup code against stored hash (constant-time comparison)
   * 5. Mark package as retrieved
   * 6. Delete storage assignment (release locker)
   * 7. Calculate storage charges
   * 8. Return package info with charges
   *
   * Security: All failures return generic INVALID_PICKUP_CODE to prevent info leakage
   */
  public async execute(input: RetrievePackageInput): Promise<RetrievePackageOutput> {
    // Step 1: Find locker by code
    const locker = await this.lockerRepository.findByCode(input.lockerCode);
    if (!locker) {
      // Generic error - don't reveal if locker doesn't exist
      return this.invalidPickupCodeError();
    }

    // Step 2: Find active storage assignment for this locker
    const assignment = await this.storageAssignmentRepository.findByLockerId(locker.id);
    if (!assignment) {
      // No active assignment - locker is empty or package already retrieved
      return this.invalidPickupCodeError();
    }

    // Step 3: Get the package
    const pkg = await this.packageRepository.findById(assignment.packageId);
    if (!pkg) {
      // Should not happen if data is consistent, but handle gracefully
      return this.invalidPickupCodeError();
    }

    // Check if package is already retrieved
    if (pkg.status === 'RETRIEVED') {
      return {
        success: false,
        error: 'PACKAGE_ALREADY_RETRIEVED',
        message: 'This package has already been retrieved.',
      };
    }

    // Verify package is in STORED state
    if (pkg.status !== 'STORED') {
      return this.invalidPickupCodeError();
    }

    // Step 4: Verify pickup code using constant-time comparison (security-critical)
    const isCodeValid = await this.pickupCodeService.verify(
      input.pickupCode,
      assignment.pickupCodeHash
    );

    if (!isCodeValid) {
      return this.invalidPickupCodeError();
    }

    // Step 5: Mark package as retrieved
    let retrievedPackage: Package;
    try {
      retrievedPackage = pkg.markAsRetrieved();
    } catch (error) {
      // State transition failed (e.g., race condition)
      return {
        success: false,
        error: 'PACKAGE_ALREADY_RETRIEVED',
        message: 'This package has already been retrieved.',
      };
    }

    // Step 6: Delete storage assignment (releases the locker for reuse)
    // Step 7: Persist the retrieved package
    try {
      await this.storageAssignmentRepository.delete(assignment.id);
      await this.packageRepository.update(retrievedPackage);
    } catch (error) {
      // Rollback would happen here in a real transaction
      return {
        success: false,
        error: 'INVALID_PICKUP_CODE',
        message: 'Unable to complete retrieval. Please try again.',
      };
    }

    // Step 8: Calculate charges
    const storedAt = pkg.storedAt!;
    const charge = this.chargeCalculationService.calculateCharge(storedAt);
    const duration = this.chargeCalculationService.calculateDuration(storedAt);

    // Return success with package info
    return {
      success: true,
      package: {
        packageId: retrievedPackage.id,
        packageReference: retrievedPackage.reference,
        lockerCode: locker.code,
        storedAt,
        retrievedAt: retrievedPackage.retrievedAt!,
        storageDuration: duration,
        storageCharge: {
          amountMinorUnits: charge.amountMinorUnits,
          currency: charge.currency,
          displayAmount: charge.displayAmount,
        },
      },
    };
  }

  /**
   * Generic error response for security
   * Prevents information leakage about whether locker exists,
   * whether package exists, or whether code was ever valid.
   */
  private invalidPickupCodeError(): RetrievePackageError {
    return {
      success: false,
      error: 'INVALID_PICKUP_CODE',
      message: 'Invalid pickup code or locker code.',
    };
  }
}
