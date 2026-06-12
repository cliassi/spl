// LockerRepository port - defines the interface for locker persistence
// Application layer depends on this port, infrastructure provides implementation

import { Locker } from '../../domain/entities/Locker.js';
import { Size } from '../../domain/valueObjects/Size.js';

export interface LockerFilters {
  size?: Size;
  available?: boolean;
  code?: string;
}

export interface FindAvailableLockersOptions {
  // Find lockers that can accommodate this package size
  packageSize?: Size;
  // Filter to specific locker size (exact match)
  lockerSize?: Size;
  // Only return available lockers (no active assignment)
  availableOnly?: boolean;
}

export interface LockerRepository {
  // Find all lockers with optional filters
  findAll(filters?: LockerFilters): Promise<Locker[]>;

  // Find available lockers for package storage
  // Returns lockers ordered by size (smallest first), then by code
  findAvailableLockers(options?: FindAvailableLockersOptions): Promise<Locker[]>;

  // Find single locker by ID
  findById(id: string): Promise<Locker | null>;

  // Find single locker by human-readable code
  findByCode(code: string): Promise<Locker | null>;

  // Check if a locker is available (no active storage assignment)
  isAvailable(lockerId: string): Promise<boolean>;

  // Find smallest available locker that can fit the package
  // This implements the "smallest suitable" allocation policy
  findSmallestSuitableLocker(packageSize: Size): Promise<Locker | null>;
}
