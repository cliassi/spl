// Package entity representing a package in the system
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { PackageStatus } from '../enums/PackageStatus.js';

export interface PackageProps {
  id: string;
  reference: string;
  size: Size;
  status: PackageStatus;
  storedAt?: Date;
  retrievedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePackageProps {
  id: string;
  reference: string;
  size: Size;
}

export class Package {
  private constructor(private readonly props: PackageProps) {}

  // Factory method for creating a new package
  public static create(props: CreatePackageProps): Package {
    const now = new Date();
    return new Package({
      id: props.id,
      reference: props.reference,
      size: props.size,
      status: PackageStatus.CREATED,
      storedAt: undefined,
      retrievedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Factory method for reconstructing from persistence
  public static reconstitute(props: PackageProps): Package {
    return new Package({ ...props });
  }

  // Getters
  public get id(): string {
    return this.props.id;
  }

  public get reference(): string {
    return this.props.reference;
  }

  public get size(): Size {
    return this.props.size;
  }

  public get status(): PackageStatus {
    return this.props.status;
  }

  public get storedAt(): Date | undefined {
    return this.props.storedAt;
  }

  public get retrievedAt(): Date | undefined {
    return this.props.retrievedAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain behavior: Mark as stored
  public markAsStored(): Package {
    if (this.props.status !== PackageStatus.CREATED) {
      throw new Error(
        `Cannot mark package as stored. Current status: ${this.props.status}. Expected: ${PackageStatus.CREATED}`
      );
    }

    const now = new Date();
    return new Package({
      ...this.props,
      status: PackageStatus.STORED,
      storedAt: now,
      updatedAt: now,
    });
  }

  // Domain behavior: Mark as retrieved
  public markAsRetrieved(): Package {
    if (this.props.status !== PackageStatus.STORED) {
      throw new Error(
        `Cannot mark package as retrieved. Current status: ${this.props.status}. Expected: ${PackageStatus.STORED}`
      );
    }

    const now = new Date();
    return new Package({
      ...this.props,
      status: PackageStatus.RETRIEVED,
      retrievedAt: now,
      updatedAt: now,
    });
  }

  // Check if package can be stored
  public canBeStored(): boolean {
    return this.props.status === PackageStatus.CREATED;
  }

  // Check if package can be retrieved
  public canBeRetrieved(): boolean {
    return this.props.status === PackageStatus.STORED;
  }

  // Check if package is currently stored (active in locker)
  public isCurrentlyStored(): boolean {
    return this.props.status === PackageStatus.STORED;
  }

  // Serialize to props for persistence
  public toProps(): PackageProps {
    return { ...this.props };
  }
}
