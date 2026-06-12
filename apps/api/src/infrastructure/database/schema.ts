import { pgTable, uuid, varchar, timestamp, check, index, unique, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Locker sizes enum values
export const lockerSizeEnum = ['SMALL', 'MEDIUM', 'LARGE'] as const;
export type LockerSize = (typeof lockerSizeEnum)[number];

// Package sizes enum values
export const packageSizeEnum = ['SMALL', 'MEDIUM', 'LARGE'] as const;
export type PackageSize = (typeof packageSizeEnum)[number];

// Package status enum values
export const packageStatusEnum = ['CREATED', 'STORED', 'RETRIEVED'] as const;
export type PackageStatus = (typeof packageStatusEnum)[number];

// Lockers table
export const lockers = pgTable(
  'lockers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    size: varchar('size', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sizeCheck: check('size_check', sql`${table.size} IN ('SMALL', 'MEDIUM', 'LARGE')`),
    codeIndex: index('lockers_code_idx').on(table.code),
  })
);

// Packages table
export const packages = pgTable(
  'packages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reference: varchar('reference', { length: 50 }).notNull().unique(),
    size: varchar('size', { length: 10 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('CREATED'),
    storedAt: timestamp('stored_at', { withTimezone: true }),
    retrievedAt: timestamp('retrieved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sizeCheck: check('package_size_check', sql`${table.size} IN ('SMALL', 'MEDIUM', 'LARGE')`),
    statusCheck: check('status_check', sql`${table.status} IN ('CREATED', 'STORED', 'RETRIEVED')`),
    referenceIndex: index('packages_reference_idx').on(table.reference),
    statusIndex: index('packages_status_idx').on(table.status),
  })
);

// Storage assignments table
export const storageAssignments = pgTable(
  'storage_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lockerId: uuid('locker_id')
      .notNull()
      .references(() => lockers.id, { onDelete: 'restrict' }),
    packageId: uuid('package_id')
      .notNull()
      .references(() => packages.id, { onDelete: 'restrict' }),
    pickupCodeHash: varchar('pickup_code_hash', { length: 255 }).notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    retrievedAt: timestamp('retrieved_at', { withTimezone: true }),
    storageChargeMinorUnits: text('storage_charge_minor_units'), // Store as text to handle bigint
    currency: varchar('currency', { length: 3 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Partial unique index: only one active assignment per locker
    // This is implemented as a unique index with a WHERE clause in migration
    lockerIndex: index('assignments_locker_idx').on(table.lockerId),
    packageIndex: index('assignments_package_idx').on(table.packageId),
    uniqueLockerPackage: unique('unique_locker_package').on(table.lockerId, table.packageId),
  })
);

// Types inferred from tables
export type Locker = typeof lockers.$inferSelect;
export type NewLocker = typeof lockers.$inferInsert;

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;

export type StorageAssignment = typeof storageAssignments.$inferSelect;
export type NewStorageAssignment = typeof storageAssignments.$inferInsert;
