// Integration tests for LockerRepositoryPostgres
import { describe, it, expect, beforeEach } from 'vitest';
import { LockerRepositoryPostgres } from './LockerRepositoryPostgres.js';
import { Size } from '../../domain/valueObjects/Size.js';
import { db } from '../../../infrastructure/database/connection.js';
import { lockers, storageAssignments, packages } from '../../../infrastructure/database/schema.js';

// Test subject
const repository = new LockerRepositoryPostgres();

describe('LockerRepositoryPostgres Integration Tests', () => {
  // Clean state before each test
  beforeEach(async () => {
    // Clean up storage assignments and packages
    await db.delete(storageAssignments);
    await db.delete(packages);
    // Note: We don't delete lockers as they are seeded data
  });

  describe('findAll', () => {
    it('should return all lockers from seeded data', async () => {
      const result = await repository.findAll();
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      // We expect 10 lockers from seed data
      expect(result.length).toBe(10);
    });

    it('should filter by size', async () => {
      const smallLockers = await repository.findAll({ size: Size.small() });
      
      expect(smallLockers.length).toBeGreaterThan(0);
      expect(smallLockers.every(l => l.size.toString() === 'SMALL')).toBe(true);
    });

    it('should filter by code', async () => {
      const locker = await repository.findAll({ code: 'L-S-001' });
      
      expect(locker.length).toBe(1);
      expect(locker[0].code).toBe('L-S-001');
    });
  });

  describe('findAvailableLockers', () => {
    it('should return all lockers when no filters applied', async () => {
      const result = await repository.findAvailableLockers();
      
      expect(result.length).toBe(10);
    });

    it('should filter by locker size', async () => {
      const result = await repository.findAvailableLockers({
        lockerSize: Size.medium(),
      });
      
      expect(result.every(l => l.size.toString() === 'MEDIUM')).toBe(true);
    });

    it('should filter by package size compatibility', async () => {
      // SMALL package fits in SMALL, MEDIUM, LARGE lockers
      const result = await repository.findAvailableLockers({
        packageSize: Size.small(),
      });
      
      expect(result.length).toBeGreaterThan(0);
      // All returned lockers should be able to accommodate SMALL package
      expect(result.every(l => Size.small().canFitInside(l.size))).toBe(true);
    });

    it('should exclude occupied lockers when availableOnly is true', async () => {
      // First, occupy a locker
      const allLockers = await repository.findAll();
      const targetLocker = allLockers[0];
      
      // Create a package and storage assignment
      const [newPackage] = await db.insert(packages).values({
        reference: 'TEST-001',
        size: 'SMALL',
        status: 'STORED',
      }).returning();
      
      await db.insert(storageAssignments).values({
        lockerId: targetLocker.id,
        packageId: newPackage.id,
        pickupCodeHash: 'hashed-code',
      });
      
      // Now fetch available lockers
      const available = await repository.findAvailableLockers({ availableOnly: true });
      
      expect(available.find(l => l.id === targetLocker.id)).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return locker by ID', async () => {
      const allLockers = await repository.findAll();
      const target = allLockers[0];
      
      const result = await repository.findById(target.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(target.id);
      expect(result?.code).toBe(target.code);
    });

    it('should return null for non-existent ID', async () => {
      const result = await repository.findById('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should return locker by code', async () => {
      const result = await repository.findByCode('L-S-001');
      
      expect(result).toBeDefined();
      expect(result?.code).toBe('L-S-001');
    });

    it('should return null for non-existent code', async () => {
      const result = await repository.findByCode('NON-EXISTENT');
      
      expect(result).toBeNull();
    });
  });

  describe('isAvailable', () => {
    it('should return true for unoccupied locker', async () => {
      const allLockers = await repository.findAll();
      const target = allLockers[0];
      
      const result = await repository.isAvailable(target.id);
      
      expect(result).toBe(true);
    });

    it('should return false for occupied locker', async () => {
      const allLockers = await repository.findAll();
      const target = allLockers[0];
      
      // Create a package and storage assignment
      const [newPackage] = await db.insert(packages).values({
        reference: 'TEST-OCCUPIED',
        size: 'SMALL',
        status: 'STORED',
      }).returning();
      
      await db.insert(storageAssignments).values({
        lockerId: target.id,
        packageId: newPackage.id,
        pickupCodeHash: 'hashed-code',
      });
      
      const result = await repository.isAvailable(target.id);
      
      expect(result).toBe(false);
    });
  });

  describe('findSmallestSuitableLocker', () => {
    it('should find smallest available locker for SMALL package', async () => {
      const result = await repository.findSmallestSuitableLocker(Size.small());
      
      expect(result).toBeDefined();
      // Should return a SMALL locker if available
      expect(result?.size.toString()).toBe('SMALL');
    });

    it('should find MEDIUM locker for MEDIUM package when SMALL is too small', async () => {
      // First, occupy all SMALL lockers
      const smallLockers = await repository.findAll({ size: Size.small() });
      
      for (const locker of smallLockers) {
        const [newPackage] = await db.insert(packages).values({
          reference: `OCCUPY-${locker.code}`,
          size: 'SMALL',
          status: 'STORED',
        }).returning();
        
        await db.insert(storageAssignments).values({
          lockerId: locker.id,
          packageId: newPackage.id,
          pickupCodeHash: 'hashed-code',
        });
      }
      
      // Now try to store a MEDIUM package
      const result = await repository.findSmallestSuitableLocker(Size.medium());
      
      expect(result).toBeDefined();
      expect(result?.size.toString()).toBe('MEDIUM');
    });

    it('should return null when no suitable locker available', async () => {
      // Occupy all lockers
      const allLockers = await repository.findAll();
      
      for (const locker of allLockers) {
        const [newPackage] = await db.insert(packages).values({
          reference: `OCCUPY-ALL-${locker.code}`,
          size: locker.size.toString(),
          status: 'STORED',
        }).returning();
        
        await db.insert(storageAssignments).values({
          lockerId: locker.id,
          packageId: newPackage.id,
          pickupCodeHash: 'hashed-code',
        });
      }
      
      const result = await repository.findSmallestSuitableLocker(Size.small());
      
      expect(result).toBeNull();
    });

    it('should return deterministic ordering (by code within size)', async () => {
      // Get multiple results for the same size
      const smallLockers = await repository.findAll({ size: Size.small() });
      
      // Keep only first one occupied, rest available
      if (smallLockers.length > 1) {
        const [newPackage] = await db.insert(packages).values({
          reference: 'OCCUPY-FIRST',
          size: 'SMALL',
          status: 'STORED',
        }).returning();
        
        await db.insert(storageAssignments).values({
          lockerId: smallLockers[0].id,
          packageId: newPackage.id,
          pickupCodeHash: 'hashed-code',
        });
      }
      
      const result = await repository.findSmallestSuitableLocker(Size.small());
      
      // Should return L-S-002 (next available after L-S-001)
      expect(result?.code).toBe('L-S-002');
    });
  });
});
