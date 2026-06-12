// StorageAssignmentRepository port - defines the interface for storage assignment persistence
// Application layer depends on this port, infrastructure provides implementation

import { StorageAssignment } from '../../domain/entities/StorageAssignment.js';

export interface StorageAssignmentFilters {
  packageId?: string;
  lockerId?: string;
}

export interface StorageAssignmentRepository {
  // Find all storage assignments with optional filters
  findAll(filters?: StorageAssignmentFilters): Promise<StorageAssignment[]>;

  // Find single assignment by ID
  findById(id: string): Promise<StorageAssignment | null>;

  // Find assignment by package ID
  findByPackageId(packageId: string): Promise<StorageAssignment | null>;

  // Find assignment by locker ID (for checking if locker is occupied)
  findByLockerId(lockerId: string): Promise<StorageAssignment | null>;

  // Check if a locker has an active assignment
  hasActiveAssignmentForLocker(lockerId: string): Promise<boolean>;

  // Save a new storage assignment
  save(assignment: StorageAssignment): Promise<void>;

  // Delete a storage assignment (when package is retrieved)
  delete(id: string): Promise<void>;
}
