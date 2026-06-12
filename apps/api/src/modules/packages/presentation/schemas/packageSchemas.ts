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

// Types inferred from schemas
export type StorePackageRequest = z.infer<typeof storePackageRequestSchema>;
export type StorePackageResponse = z.infer<typeof storePackageResponseSchema>;
export type PackageErrorResponse = z.infer<typeof packageErrorResponseSchema>;
