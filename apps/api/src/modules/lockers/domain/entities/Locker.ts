// Locker entity - represents a physical storage compartment
// Follows domain-driven design with immutability and validation

import { Size } from '../valueObjects/Size.js';

export interface LockerProps {
  id: string;
  code: string;
  size: Size;
  createdAt: Date;
  updatedAt: Date;
}

export class Locker {
  private readonly _id: string;
  private readonly _code: string;
  private readonly _size: Size;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: LockerProps) {
    this._id = props.id;
    this._code = props.code;
    this._size = props.size;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;

    // Validate invariants
    if (!this._id) {
      throw new Error('Locker must have an id');
    }
    if (!this._code || this._code.length === 0) {
      throw new Error('Locker must have a code');
    }
    if (!this._size) {
      throw new Error('Locker must have a size');
    }

    Object.freeze(this);
  }

  get id(): string {
    return this._id;
  }

  get code(): string {
    return this._code;
  }

  get size(): Size {
    return this._size;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Check if this locker can accommodate a package of given size
  canAccommodate(packageSize: Size): boolean {
    return packageSize.canFitInside(this._size);
  }

  // Factory method to create from database record
  static fromDatabase(record: {
    id: string;
    code: string;
    size: string;
    createdAt: Date;
    updatedAt: Date;
  }): Locker {
    return new Locker({
      id: record.id,
      code: record.code,
      size: Size.fromString(record.size),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toJSON(): object {
    return {
      id: this._id,
      code: this._code,
      size: this._size.toString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
