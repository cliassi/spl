// Zod schemas for locker API validation and serialization
import { z } from 'zod';

// Size enum validation
export const sizeSchema = z.enum(['SMALL', 'MEDIUM', 'LARGE']);

// Query parameters for GET /api/v1/lockers
export const listLockersQuerySchema = z.object({
  size: sizeSchema.optional(),
  available: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

// Locker response DTO
export const lockerResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  size: sizeSchema,
  isAvailable: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// List response (array of lockers)
export const listLockersResponseSchema = z.array(lockerResponseSchema);

// Error response schema
export const errorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
  details: z.array(z.string()).optional(),
});

// Types inferred from schemas
export type ListLockersQuery = z.infer<typeof listLockersQuerySchema>;
export type LockerResponse = z.infer<typeof lockerResponseSchema>;
export type ListLockersResponse = z.infer<typeof listLockersResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
