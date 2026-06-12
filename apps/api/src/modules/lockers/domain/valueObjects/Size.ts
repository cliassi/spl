// Size value object for lockers and packages
// Represents SMALL, MEDIUM, LARGE with ordering and compatibility rules

export const SizeEnum = {
  SMALL: 0,
  MEDIUM: 1,
  LARGE: 2,
} as const;

export type SizeValue = (typeof SizeEnum)[keyof typeof SizeEnum];

export class Size {
  private readonly _value: SizeValue;

  private constructor(value: SizeValue) {
    this._value = value;
    Object.freeze(this);
  }

  // Factory methods for each size
  static small(): Size {
    return new Size(SizeEnum.SMALL);
  }

  static medium(): Size {
    return new Size(SizeEnum.MEDIUM);
  }

  static large(): Size {
    return new Size(SizeEnum.LARGE);
  }

  // Create from string (for deserialization)
  static fromString(size: string): Size {
    const normalized = size.toUpperCase();
    switch (normalized) {
      case 'SMALL':
        return Size.small();
      case 'MEDIUM':
        return Size.medium();
      case 'LARGE':
        return Size.large();
      default:
        throw new InvalidSizeError(`Invalid size: ${size}. Must be SMALL, MEDIUM, or LARGE.`);
    }
  }

  // Create from number (for database deserialization)
  static fromNumber(value: number): Size {
    if (value === SizeEnum.SMALL) return Size.small();
    if (value === SizeEnum.MEDIUM) return Size.medium();
    if (value === SizeEnum.LARGE) return Size.large();
    throw new InvalidSizeError(`Invalid size value: ${value}. Must be 0 (SMALL), 1 (MEDIUM), or 2 (LARGE).`);
  }

  // Comparison methods
  equals(other: Size): boolean {
    return this._value === other._value;
  }

  lessThan(other: Size): boolean {
    return this._value < other._value;
  }

  lessThanOrEqual(other: Size): boolean {
    return this._value <= other._value;
  }

  greaterThan(other: Size): boolean {
    return this._value > other._value;
  }

  greaterThanOrEqual(other: Size): boolean {
    return this._value >= other._value;
  }

  // Size compatibility: this size can fit inside other size
  // Package size ≤ Locker size means package fits in locker
  canFitInside(other: Size): boolean {
    return this.lessThanOrEqual(other);
  }

  // For locker allocation: check if locker can accommodate package
  static canAccommodate(lockerSize: Size, packageSize: Size): boolean {
    return packageSize.canFitInside(lockerSize);
  }

  // Get the value
  get value(): SizeValue {
    return this._value;
  }

  // Get string representation
  toString(): 'SMALL' | 'MEDIUM' | 'LARGE' {
    switch (this._value) {
      case SizeEnum.SMALL:
        return 'SMALL';
      case SizeEnum.MEDIUM:
        return 'MEDIUM';
      case SizeEnum.LARGE:
        return 'LARGE';
    }
  }

  // For JSON serialization
  toJSON(): string {
    return this.toString();
  }
}

export class InvalidSizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSizeError';
  }
}
