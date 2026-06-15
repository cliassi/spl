// PostgreSQL implementation of StorageAssignmentRepository port
import {
  StorageAssignmentRepository,
  StorageAssignmentFilters,
} from '../../application/ports/StorageAssignmentRepository.js';
import { StorageAssignment, StorageAssignmentProps } from '../../domain/entities/StorageAssignment.js';
import { db } from '../../../../infrastructure/database/connection.js';
import { storageAssignments as assignmentsTable } from '../../../../infrastructure/database/schema.js';
import { eq, and } from 'drizzle-orm';

export class StorageAssignmentRepositoryPostgres implements StorageAssignmentRepository {
  async findAll(filters?: StorageAssignmentFilters): Promise<StorageAssignment[]> {
    const conditions = [];
    
    if (filters?.packageId) {
      conditions.push(eq(assignmentsTable.packageId, filters.packageId));
    }
    if (filters?.lockerId) {
      conditions.push(eq(assignmentsTable.lockerId, filters.lockerId));
    }

    const rows = conditions.length > 0
      ? await db.select().from(assignmentsTable).where(and(...conditions))
      : await db.select().from(assignmentsTable);
      
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<StorageAssignment | null> {
    const rows = await db
      .select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.id, id))
      .limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async findByPackageId(packageId: string): Promise<StorageAssignment | null> {
    const rows = await db
      .select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.packageId, packageId))
      .limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async findByLockerId(lockerId: string): Promise<StorageAssignment | null> {
    const rows = await db
      .select()
      .from(assignmentsTable)
      .where(eq(assignmentsTable.lockerId, lockerId))
      .limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async hasActiveAssignmentForLocker(lockerId: string): Promise<boolean> {
    const rows = await db
      .select({ id: assignmentsTable.id })
      .from(assignmentsTable)
      .where(eq(assignmentsTable.lockerId, lockerId))
      .limit(1);
    return rows.length > 0;
  }

  async save(assignment: StorageAssignment): Promise<void> {
    const props = assignment.toProps();
    await db.insert(assignmentsTable).values({
      id: props.id,
      packageId: props.packageId,
      lockerId: props.lockerId,
      pickupCodeHash: props.pickupCodeHash,
      createdAt: props.createdAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(assignmentsTable).where(eq(assignmentsTable.id, id));
  }

  private toEntity(row: typeof assignmentsTable.$inferSelect): StorageAssignment {
    const props: StorageAssignmentProps = {
      id: row.id,
      packageId: row.packageId,
      lockerId: row.lockerId,
      pickupCodeHash: row.pickupCodeHash,
      createdAt: row.createdAt,
    };
    return StorageAssignment.reconstitute(props);
  }
}
