// Unit tests for Package entity
import { describe, it, expect } from 'vitest';
import { Package } from './Package.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { PackageStatus } from '../enums/PackageStatus.js';

describe('Package Entity', () => {
  describe('create', () => {
    it('should create a package with CREATED status', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      expect(pkg.id).toBe('pkg-123');
      expect(pkg.reference).toBe('PKG-REF-001');
      expect(pkg.status).toBe(PackageStatus.CREATED);
      expect(pkg.size.toString()).toBe('SMALL');
      expect(pkg.storedAt).toBeUndefined();
      expect(pkg.retrievedAt).toBeUndefined();
    });

    it('should set createdAt and updatedAt on creation', () => {
      const before = new Date();
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.medium(),
      });
      const after = new Date();

      expect(pkg.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(pkg.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(pkg.updatedAt.getTime()).toBe(pkg.createdAt.getTime());
    });
  });

  describe('markAsStored', () => {
    it('should transition from CREATED to STORED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      const stored = pkg.markAsStored();

      expect(stored.status).toBe(PackageStatus.STORED);
      expect(stored.storedAt).toBeDefined();
      expect(stored.storedAt!.getTime()).toBeGreaterThan(0);
    });

    it('should update updatedAt timestamp', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const originalUpdatedAt = pkg.updatedAt;

      const stored = pkg.markAsStored();

      expect(stored.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when transitioning from STORED to STORED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();

      expect(() => stored.markAsStored()).toThrow(
        'Cannot mark package as stored. Current status: STORED. Expected: CREATED'
      );
    });

    it('should throw error when transitioning from RETRIEVED to STORED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();
      const retrieved = stored.markAsRetrieved();

      expect(() => retrieved.markAsStored()).toThrow(
        'Cannot mark package as stored. Current status: RETRIEVED. Expected: CREATED'
      );
    });
  });

  describe('markAsRetrieved', () => {
    it('should transition from STORED to RETRIEVED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();

      const retrieved = stored.markAsRetrieved();

      expect(retrieved.status).toBe(PackageStatus.RETRIEVED);
      expect(retrieved.retrievedAt).toBeDefined();
    });

    it('should update updatedAt timestamp', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();
      const originalUpdatedAt = stored.updatedAt;

      const retrieved = stored.markAsRetrieved();

      expect(retrieved.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when transitioning from CREATED to RETRIEVED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      expect(() => pkg.markAsRetrieved()).toThrow(
        'Cannot mark package as retrieved. Current status: CREATED. Expected: STORED'
      );
    });

    it('should throw error when transitioning from RETRIEVED to RETRIEVED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();
      const retrieved = stored.markAsRetrieved();

      expect(() => retrieved.markAsRetrieved()).toThrow(
        'Cannot mark package as retrieved. Current status: RETRIEVED. Expected: STORED'
      );
    });
  });

  describe('canBeStored', () => {
    it('should return true when status is CREATED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      expect(pkg.canBeStored()).toBe(true);
    });

    it('should return false when status is STORED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();

      expect(stored.canBeStored()).toBe(false);
    });

    it('should return false when status is RETRIEVED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();
      const retrieved = stored.markAsRetrieved();

      expect(retrieved.canBeStored()).toBe(false);
    });
  });

  describe('canBeRetrieved', () => {
    it('should return true when status is STORED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();

      expect(stored.canBeRetrieved()).toBe(true);
    });

    it('should return false when status is CREATED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      expect(pkg.canBeRetrieved()).toBe(false);
    });

    it('should return false when status is RETRIEVED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();
      const retrieved = stored.markAsRetrieved();

      expect(retrieved.canBeRetrieved()).toBe(false);
    });
  });

  describe('isCurrentlyStored', () => {
    it('should return true when status is STORED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();

      expect(stored.isCurrentlyStored()).toBe(true);
    });

    it('should return false when status is CREATED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      expect(pkg.isCurrentlyStored()).toBe(false);
    });

    it('should return false when status is RETRIEVED', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });
      const stored = pkg.markAsStored();
      const retrieved = stored.markAsRetrieved();

      expect(retrieved.isCurrentlyStored()).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstruct package from props', () => {
      const createdAt = new Date('2025-01-01');
      const storedAt = new Date('2025-01-02');
      const updatedAt = new Date('2025-01-03');

      const pkg = Package.reconstitute({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.large(),
        status: PackageStatus.STORED,
        storedAt,
        retrievedAt: undefined,
        createdAt,
        updatedAt,
      });

      expect(pkg.id).toBe('pkg-123');
      expect(pkg.reference).toBe('PKG-REF-001');
      expect(pkg.status).toBe(PackageStatus.STORED);
      expect(pkg.size.toString()).toBe('LARGE');
      expect(pkg.storedAt).toBe(storedAt);
      expect(pkg.createdAt).toBe(createdAt);
      expect(pkg.updatedAt).toBe(updatedAt);
    });
  });

  describe('toProps', () => {
    it('should return props for persistence', () => {
      const pkg = Package.create({
        id: 'pkg-123',
        reference: 'PKG-REF-001',
        size: Size.small(),
      });

      const props = pkg.toProps();

      expect(props.id).toBe('pkg-123');
      expect(props.reference).toBe('PKG-REF-001');
      expect(props.status).toBe(PackageStatus.CREATED);
    });
  });
});
