// StorageAssignment entity representing a package-to-locker assignment
export interface StorageAssignmentProps {
  id: string;
  packageId: string;
  lockerId: string;
  pickupCodeHash: string;
  createdAt: Date;
}

export interface CreateStorageAssignmentProps {
  id: string;
  packageId: string;
  lockerId: string;
  pickupCodeHash: string;
}

export class StorageAssignment {
  private constructor(private readonly props: StorageAssignmentProps) {}

  // Factory method for creating a new assignment
  public static create(props: CreateStorageAssignmentProps): StorageAssignment {
    return new StorageAssignment({
      id: props.id,
      packageId: props.packageId,
      lockerId: props.lockerId,
      pickupCodeHash: props.pickupCodeHash,
      createdAt: new Date(),
    });
  }

  // Factory method for reconstructing from persistence
  public static reconstitute(props: StorageAssignmentProps): StorageAssignment {
    return new StorageAssignment({ ...props });
  }

  // Getters
  public get id(): string {
    return this.props.id;
  }

  public get packageId(): string {
    return this.props.packageId;
  }

  public get lockerId(): string {
    return this.props.lockerId;
  }

  public get pickupCodeHash(): string {
    return this.props.pickupCodeHash;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  // Serialize to props for persistence
  public toProps(): StorageAssignmentProps {
    return { ...this.props };
  }
}
