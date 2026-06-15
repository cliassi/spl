// PostgreSQL implementation of PackageRepository port
import { PackageRepository, PackageFilters } from '../../application/ports/PackageRepository.js';
import { Package, PackageProps } from '../../domain/entities/Package.js';
import { PackageStatus } from '../../domain/enums/PackageStatus.js';
import { db } from '../../../../infrastructure/database/connection.js';
import { packages as packagesTable } from '../../../../infrastructure/database/schema.js';
import { eq, and, like } from 'drizzle-orm';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';

export class PackageRepositoryPostgres implements PackageRepository {
  async findAll(filters?: PackageFilters): Promise<Package[]> {
    let query = db.select().from(packagesTable);

    if (filters) {
      const conditions = [];
      if (filters.status) {
        conditions.push(eq(packagesTable.status, filters.status));
      }
      if (filters.reference) {
        conditions.push(like(packagesTable.reference, `%${filters.reference}%`));
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    const rows = await query;
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Package | null> {
    const rows = await db.select().from(packagesTable).where(eq(packagesTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async findByReference(reference: string): Promise<Package | null> {
    const rows = await db
      .select()
      .from(packagesTable)
      .where(eq(packagesTable.reference, reference))
      .limit(1);
    if (rows.length === 0) return null;
    return this.toEntity(rows[0]);
  }

  async existsByReference(reference: string): Promise<boolean> {
    const rows = await db
      .select({ id: packagesTable.id })
      .from(packagesTable)
      .where(eq(packagesTable.reference, reference))
      .limit(1);
    return rows.length > 0;
  }

  async save(pkg: Package): Promise<void> {
    const props = pkg.toProps();
    await db.insert(packagesTable).values({
      id: props.id,
      reference: props.reference,
      size: props.size.toString(),
      status: props.status,
      storedAt: props.storedAt,
      retrievedAt: props.retrievedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(pkg: Package): Promise<void> {
    const props = pkg.toProps();
    await db
      .update(packagesTable)
      .set({
        reference: props.reference,
        size: props.size.toString(),
        status: props.status,
        storedAt: props.storedAt,
        retrievedAt: props.retrievedAt,
        updatedAt: props.updatedAt,
      })
      .where(eq(packagesTable.id, props.id));
  }

  private toEntity(row: typeof packagesTable.$inferSelect): Package {
    const props: PackageProps = {
      id: row.id,
      reference: row.reference,
      size: Size.fromString(row.size),
      status: row.status as PackageStatus,
      storedAt: row.storedAt ?? undefined,
      retrievedAt: row.retrievedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Package.reconstitute(props);
  }
}
