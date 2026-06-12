import { describe, it, expect } from 'vitest';
import { Size, SizeEnum, InvalidSizeError } from './Size.js';

describe('Size', () => {
  describe('creation', () => {
    it('should create SMALL size', () => {
      const size = Size.small();
      expect(size.value).toBe(SizeEnum.SMALL);
      expect(size.toString()).toBe('SMALL');
    });

    it('should create MEDIUM size', () => {
      const size = Size.medium();
      expect(size.value).toBe(SizeEnum.MEDIUM);
      expect(size.toString()).toBe('MEDIUM');
    });

    it('should create LARGE size', () => {
      const size = Size.large();
      expect(size.value).toBe(SizeEnum.LARGE);
      expect(size.toString()).toBe('LARGE');
    });

    it('should create from string', () => {
      expect(Size.fromString('SMALL').value).toBe(SizeEnum.SMALL);
      expect(Size.fromString('MEDIUM').value).toBe(SizeEnum.MEDIUM);
      expect(Size.fromString('LARGE').value).toBe(SizeEnum.LARGE);
    });

    it('should create from string case-insensitively', () => {
      expect(Size.fromString('small').value).toBe(SizeEnum.SMALL);
      expect(Size.fromString('Medium').value).toBe(SizeEnum.MEDIUM);
      expect(Size.fromString('LARGE').value).toBe(SizeEnum.LARGE);
    });

    it('should throw for invalid string', () => {
      expect(() => Size.fromString('XL')).toThrow(InvalidSizeError);
      expect(() => Size.fromString('invalid')).toThrow(InvalidSizeError);
    });

    it('should create from number', () => {
      expect(Size.fromNumber(0).value).toBe(SizeEnum.SMALL);
      expect(Size.fromNumber(1).value).toBe(SizeEnum.MEDIUM);
      expect(Size.fromNumber(2).value).toBe(SizeEnum.LARGE);
    });

    it('should throw for invalid number', () => {
      expect(() => Size.fromNumber(-1)).toThrow(InvalidSizeError);
      expect(() => Size.fromNumber(3)).toThrow(InvalidSizeError);
    });
  });

  describe('immutability', () => {
    it('should be immutable', () => {
      const size = Size.small();
      expect(() => {
        (size as unknown as { _value: number })._value = 2;
      }).toThrow();
    });
  });

  describe('comparison', () => {
    it('should correctly compare equal sizes', () => {
      expect(Size.small().equals(Size.small())).toBe(true);
      expect(Size.medium().equals(Size.medium())).toBe(true);
      expect(Size.large().equals(Size.large())).toBe(true);
      expect(Size.small().equals(Size.medium())).toBe(false);
    });

    it('should correctly compare less than', () => {
      expect(Size.small().lessThan(Size.medium())).toBe(true);
      expect(Size.small().lessThan(Size.large())).toBe(true);
      expect(Size.medium().lessThan(Size.large())).toBe(true);
      expect(Size.medium().lessThan(Size.small())).toBe(false);
      expect(Size.large().lessThan(Size.small())).toBe(false);
    });

    it('should correctly compare less than or equal', () => {
      expect(Size.small().lessThanOrEqual(Size.small())).toBe(true);
      expect(Size.small().lessThanOrEqual(Size.medium())).toBe(true);
      expect(Size.medium().lessThanOrEqual(Size.medium())).toBe(true);
      expect(Size.large().lessThanOrEqual(Size.small())).toBe(false);
    });

    it('should correctly compare greater than', () => {
      expect(Size.large().greaterThan(Size.medium())).toBe(true);
      expect(Size.large().greaterThan(Size.small())).toBe(true);
      expect(Size.medium().greaterThan(Size.small())).toBe(true);
      expect(Size.small().greaterThan(Size.medium())).toBe(false);
    });

    it('should correctly compare greater than or equal', () => {
      expect(Size.large().greaterThanOrEqual(Size.large())).toBe(true);
      expect(Size.large().greaterThanOrEqual(Size.medium())).toBe(true);
      expect(Size.medium().greaterThanOrEqual(Size.medium())).toBe(true);
      expect(Size.small().greaterThanOrEqual(Size.medium())).toBe(false);
    });
  });

  describe('size compatibility', () => {
    it('should allow same size to fit', () => {
      expect(Size.small().canFitInside(Size.small())).toBe(true);
      expect(Size.medium().canFitInside(Size.medium())).toBe(true);
      expect(Size.large().canFitInside(Size.large())).toBe(true);
    });

    it('should allow smaller to fit in larger', () => {
      // Package size ≤ Locker size
      expect(Size.small().canFitInside(Size.medium())).toBe(true);
      expect(Size.small().canFitInside(Size.large())).toBe(true);
      expect(Size.medium().canFitInside(Size.large())).toBe(true);
    });

    it('should not allow larger to fit in smaller', () => {
      // Package size > Locker size - does not fit
      expect(Size.medium().canFitInside(Size.small())).toBe(false);
      expect(Size.large().canFitInside(Size.small())).toBe(false);
      expect(Size.large().canFitInside(Size.medium())).toBe(false);
    });

    it('should work with static canAccommodate', () => {
      // Locker can accommodate package if package ≤ locker
      expect(Size.canAccommodate(Size.large(), Size.small())).toBe(true);
      expect(Size.canAccommodate(Size.medium(), Size.medium())).toBe(true);
      expect(Size.canAccommodate(Size.small(), Size.medium())).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      expect(JSON.stringify(Size.small())).toBe('"SMALL"');
      expect(JSON.stringify(Size.medium())).toBe('"MEDIUM"');
      expect(JSON.stringify(Size.large())).toBe('"LARGE"');
    });
  });
});
