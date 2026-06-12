// PackageRepository port - defines the interface for package persistence
// Application layer depends on this port, infrastructure provides implementation

import { Package } from '../../domain/entities/Package.js';
import { PackageStatus } from '../../domain/enums/PackageStatus.js';

export interface PackageFilters {
  status?: PackageStatus;
  reference?: string;
}

export interface PackageRepository {
  // Find all packages with optional filters
  findAll(filters?: PackageFilters): Promise<Package[]>;

  // Find single package by ID
  findById(id: string): Promise<Package | null>;

  // Find single package by reference
  findByReference(reference: string): Promise<Package | null>;

  // Check if a package reference already exists
  existsByReference(reference: string): Promise<boolean>;

  // Save a new package
  save(pkg: Package): Promise<void>;

  // Update an existing package
  update(pkg: Package): Promise<void>;
}
