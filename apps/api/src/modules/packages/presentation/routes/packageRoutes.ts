// Fastify route handlers for package endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StorePackageUseCase } from '../../application/useCases/StorePackageUseCase.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { PackageRepositoryPostgres } from '../../infrastructure/repositories/PackageRepositoryPostgres.js';
import { StorageAssignmentRepositoryPostgres } from '../../infrastructure/repositories/StorageAssignmentRepositoryPostgres.js';
import { LockerRepositoryPostgres } from '../../../lockers/infrastructure/repositories/LockerRepositoryPostgres.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { randomUUID } from 'crypto';
import {
  storePackageRequestSchema,
  storePackageResponseSchema,
  packageErrorResponseSchema,
} from '../schemas/packageSchemas.js';

// Repository and service instances (would typically be injected via DI in production)
const packageRepository = new PackageRepositoryPostgres();
const storageAssignmentRepository = new StorageAssignmentRepositoryPostgres();
const lockerRepository = new LockerRepositoryPostgres();
const pickupCodeService = new PickupCodeService();

const storePackageUseCase = new StorePackageUseCase(
  packageRepository,
  storageAssignmentRepository,
  lockerRepository,
  pickupCodeService,
  randomUUID
);

// POST /api/v1/packages - Store a package in a locker
async function storePackage(
  request: FastifyRequest<{ Body: { reference: string; size: string } }>,
  reply: FastifyReply
) {
  try {
    // Validate request body
    const bodyResult = storePackageRequestSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        code: 'INVALID_REQUEST',
        message: 'Invalid request body',
        details: bodyResult.error.errors.map((e) => e.message),
      });
    }

    const { reference, size } = bodyResult.data;

    // Execute use case
    const result = await storePackageUseCase.execute({
      reference,
      size: Size.fromString(size),
    });

    if (!result.success) {
      // Map use case errors to HTTP status codes
      switch (result.error) {
        case 'DUPLICATE_REFERENCE':
          return reply.status(409).send({
            code: 'DUPLICATE_REFERENCE',
            message: result.message,
          });
        case 'NO_SUITABLE_LOCKER':
          return reply.status(422).send({
            code: 'NO_SUITABLE_LOCKER',
            message: result.message,
          });
        case 'STORAGE_FAILED':
          return reply.status(500).send({
            code: 'STORAGE_FAILED',
            message: result.message,
          });
        default:
          return reply.status(500).send({
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          });
      }
    }

    // Validate and send success response
    const response = {
      packageId: result.package.id,
      lockerCode: result.lockerCode,
      pickupCode: result.pickupCode,
      message: 'Package stored successfully. Save your pickup code - it will not be shown again.',
    };

    const validatedResponse = storePackageResponseSchema.parse(response);
    return reply.status(201).send(validatedResponse);
  } catch (error) {
    request.log.error(error, 'Error storing package');
    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Failed to store package',
    });
  }
}

// Register routes
export async function packageRoutes(app: FastifyInstance) {
  // POST /api/v1/packages
  app.post('/', storePackage);
}
