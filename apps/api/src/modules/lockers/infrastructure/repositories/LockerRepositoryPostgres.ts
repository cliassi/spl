// PostgreSQL implementation of LockerRepository
// Uses Drizzle ORM for database queries

import { eq, and, isNull, inArray, asc, desc } from 'drizzle-orm';
import { db } from '../../../../infrastructure/database/connection.js';
import {
  lockers,
  storageAssignments,
  type Locker as LockerRecord,
} from '../../../../infrastructure/database/schema.js';
import { Locker } from '../../domain/entities/Locker.js';
import { Size } from '../../domain/valueObjects/Size.js';
import {
  type LockerRepository,
  type LockerFilters,
  type FindAvailableLockersOptions,
} from '../../application/ports/LockerRepository.js';

export class LockerRepositoryPostgres implements LockerRepository {
  async findAll(filters?: LockerFilters): Promise<Locker[]> {
    let query = db.select().from(lockers);

    if (filters?.size) {
      query = query.where(eq(lockers.size, filters.size.toString()));
    }

    if (filters?.code) {
      query = query.where(eq(lockers.code, filters.code));
    }

    // Order by code for deterministic results
    const records = await query.orderBy(asc(lockers.code));

    return records.map((record) => this.toDomain(record));
  }

  async findAvailableLockers(
    options: FindAvailableLockersOptions = {}
  ): Promise<Locker[]> {
    // Find lockers that can accommodate the package size
    // and are available (no active storage assignment)

    // Get all lockers first
    let query = db.select().from(lockers);

    // Filter by locker size if specified
    if (options.lockerSize) {
      query = query.where(eq(lockers.size, options.lockerSize.toString()));
    }

    // Get lockers ordered by size (numeric), then by code
    const records = await query.orderBy(
      asc(lockers.size),
      asc(lockers.code)
    );

    // Filter by availability if requested
    if (options.availableOnly !== false) {
      const availableLockerIds = await this.findAvailableLockerIds();
      const availableSet = new Set(availableLockerIds);
      const availableRecords = records.filter((r) => availableSet.has(r.id));

      // Now filter by package size compatibility
      if (options.packageSize) {
        return availableRecords
          .filter((record) => {
            const lockerSize = Size.fromString(record.size);
            return options.packageSize!.canFitInside(lockerSize);
          })
          .map((record) => this.toDomain(record));
      }

      return availableRecords.map((record) => this.toDomain(record));
    }

    // Not filtering by availability, just size compatibility
    if (options.packageSize) {
      return records
        .filter((record) => {
          const lockerSize = Size.fromString(record.size);
          return options.packageSize!.canFitInside(lockerSize);
        })
        .map((record) => this.toDomain(record));
    }

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Locker | null> {
    const records = await db.select().from(lockers).where(eq(lockers.id, id));

    if (records.length === 0) {
      return null;
    }

    return this.toDomain(records[0]);
  }

  async findByCode(code: string): Promise<Locker | null> {
    const records = await db
      .select()
      .from(lockers)
      .where(eq(lockers.code, code));

    if (records.length === 0) {
      return null;
    }

    return this.toDomain(records[0]);
  }

  async isAvailable(lockerId: string): Promise<boolean> {
    // A locker is available if there is no active storage assignment
    // (no assignment with retrievedAt IS NULL for this locker)
    const assignments = await db
      .select()
      .from(storageAssignments)
      .where(
        and(
          eq(storageAssignments.lockerId, lockerId),
          isNull(storageAssignments.retrievedAt)
        )
      );

    return assignments.length === 0;
  }

  async findSmallestSuitableLocker(packageSize: Size): Promise<Locker | null> {
    // Find the smallest available locker that can fit the package
    // Order: SMALL first, then MEDIUM, then LARGE

    const sizeOrder = ['SMALL', 'MEDIUM', 'LARGE'];

    for (const sizeStr of sizeOrder) {
      const lockerSize = Size.fromString(sizeStr);

      // Check if this size can accommodate the package
      if (!packageSize.canFitInside(lockerSize)) {
        continue;
      }

      // Find available lockers of this size
      const lockersOfSize = await db
        .select()
        .from(lockers)
        .where(eq(lockers.size, sizeStr))
        .orderBy(asc(lockers.code));

      // Check each locker for availability
      for (const record of lockersOfSize) {
        const isAvailable = await this.isAvailable(record.id);
        if (isAvailable) {
          return this.toDomain(record);
        }
      }
    }

    // No suitable locker found
    return null;
  }

  // Helper method to map database record to domain entity
  private toDomain(record: LockerRecord): Locker {
    return Locker.fromDatabase({
      id: record.id,
      code: record.code,
      size: record.size,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // Helper to find IDs of available lockers
  private async findAvailableLockerIds(): Promise<string[]> {
    // Find all lockers that have NO active storage assignment
    // A locker is unavailable if there's a storage_assignment with retrievedAt IS NULL

    // Get all lockers
    const allLockers = await db.select({ id: lockers.id }).from(lockers);

    // Get lockers with active assignments
    const assignedLockers = await db
      .select({ lockerId: storageAssignments.lockerId })
      .from(storageAssignments)
      .where(isNull(storageAssignments.retrievedAt));

    const assignedIds = new Set(assignedLockers.map((a) => a.lockerId));

    // Return lockers that are NOT in the assigned set
    return allLockers
      .map((l) => l.id)
      .filter((id) => !assignedIds.has(id));
  }
}
