// Unit tests for StorageAssignment entity
import { describe, it, expect } from 'vitest';
import { StorageAssignment } from './StorageAssignment.js';

describe('StorageAssignment Entity', () => {
  describe('create', () => {
    it('should create a storage assignment with all properties', () => {
      const assignment = StorageAssignment.create({
        id: 'assignment-123',
        packageId: 'package-456',
        lockerId: 'locker-789',
        pickupCodeHash: '$2b$10$hashedcodehere',
      });

      expect(assignment.id).toBe('assignment-123');
      expect(assignment.packageId).toBe('package-456');
      expect(assignment.lockerId).toBe('locker-789');
      expect(assignment.pickupCodeHash).toBe('$2b$10$hashedcodehere');
    });

    it('should set createdAt on creation', () => {
      const before = new Date();
      const assignment = StorageAssignment.create({
        id: 'assignment-123',
        packageId: 'package-456',
        lockerId: 'locker-789',
        pickupCodeHash: '$2b$10$hashedcodehere',
      });
      const after = new Date();

      expect(assignment.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(assignment.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('reconstitute', () => {
    it('should reconstruct assignment from props', () => {
      const createdAt = new Date('2025-01-01');

      const assignment = StorageAssignment.reconstitute({
        id: 'assignment-123',
        packageId: 'package-456',
        lockerId: 'locker-789',
        pickupCodeHash: '$2b$10$hashedcodehere',
        createdAt,
      });

      expect(assignment.id).toBe('assignment-123');
      expect(assignment.packageId).toBe('package-456');
      expect(assignment.lockerId).toBe('locker-789');
      expect(assignment.pickupCodeHash).toBe('$2b$10$hashedcodehere');
      expect(assignment.createdAt).toBe(createdAt);
    });
  });

  describe('toProps', () => {
    it('should return props for persistence', () => {
      const assignment = StorageAssignment.create({
        id: 'assignment-123',
        packageId: 'package-456',
        lockerId: 'locker-789',
        pickupCodeHash: '$2b$10$hashedcodehere',
      });

      const props = assignment.toProps();

      expect(props.id).toBe('assignment-123');
      expect(props.packageId).toBe('package-456');
      expect(props.lockerId).toBe('locker-789');
      expect(props.pickupCodeHash).toBe('$2b$10$hashedcodehere');
    });
  });
});
