// Zod schemas for package API validation and serialization
import { z } from 'zod';

// Size enum validation
export const sizeSchema = z.enum(['SMALL', 'MEDIUM', 'LARGE']);

// Request body for POST /api/v1/packages
export const storePackageRequestSchema = z.object({
  reference: z.string().min(1).max(100),
  size: sizeSchema,
});

// Success response for storing a package
export const storePackageResponseSchema = z.object({
  packageId: z.string().uuid(),
  lockerCode: z.string(),
  pickupCode: z.string(),
  message: z.string(),
});

// Error response schema
export const packageErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
  details: z.array(z.string()).optional(),
});

// Request body for POST /api/v1/packages/retrieval
export const retrievePackageRequestSchema = z.object({
  lockerCode: z.string().min(1).max(20),
  pickupCode: z.string().min(4).max(20),
});

// Success response for retrieving a package
export const retrievePackageResponseSchema = z.object({
  packageId: z.string().uuid(),
  packageReference: z.string(),
  lockerCode: z.string(),
  storedAt: z.string().datetime(),
  retrievedAt: z.string().datetime(),
  storageDuration: z.string(),
  storageCharge: z.object({
    amountMinorUnits: z.number().int(),
    currency: z.string(),
    displayAmount: z.string(),
  }),
});

// Types inferred from schemas
export type StorePackageRequest = z.infer<typeof storePackageRequestSchema>;
export type StorePackageResponse = z.infer<typeof storePackageResponseSchema>;
export type PackageErrorResponse = z.infer<typeof packageErrorResponseSchema>;
export type RetrievePackageRequest = z.infer<typeof retrievePackageRequestSchema>;
export type RetrievePackageResponse = z.infer<typeof retrievePackageResponseSchema>;
