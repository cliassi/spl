// Fastify route handlers for package endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StorePackageUseCase } from '../../application/useCases/StorePackageUseCase.js';
import { RetrievePackageUseCase } from '../../application/useCases/RetrievePackageUseCase.js';
import { PickupCodeService } from '../../domain/services/PickupCodeService.js';
import { ChargeCalculationService } from '../../domain/services/ChargeCalculationService.js';
import { SystemClock } from '../../../shared/domain/Clock.js';
import { PackageRepositoryPostgres } from '../../infrastructure/repositories/PackageRepositoryPostgres.js';
import { StorageAssignmentRepositoryPostgres } from '../../infrastructure/repositories/StorageAssignmentRepositoryPostgres.js';
import { LockerRepositoryPostgres } from '../../../lockers/infrastructure/repositories/LockerRepositoryPostgres.js';
import { Size } from '../../../lockers/domain/valueObjects/Size.js';
import { randomUUID } from 'crypto';
import {
  storePackageRequestSchema,
  storePackageResponseSchema,
  packageErrorResponseSchema,
  retrievePackageRequestSchema,
  retrievePackageResponseSchema,
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

const clock = new SystemClock();
const chargeCalculationService = new ChargeCalculationService(clock);

const retrievePackageUseCase = new RetrievePackageUseCase(
  packageRepository,
  storageAssignmentRepository,
  lockerRepository,
  pickupCodeService,
  chargeCalculationService
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

// POST /api/v1/packages/retrieval - Retrieve a package using pickup code
async function retrievePackage(
  request: FastifyRequest<{ Body: { lockerCode: string; pickupCode: string } }>,
  reply: FastifyReply
) {
  try {
    // Validate request body
    const bodyResult = retrievePackageRequestSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: bodyResult.error.errors.map((e) => e.message),
      });
    }

    const { lockerCode, pickupCode } = bodyResult.data;

    // Execute use case
    const result = await retrievePackageUseCase.execute({
      lockerCode,
      pickupCode,
    });

    if (!result.success) {
      // Map use case errors to HTTP status codes
      switch (result.error) {
        case 'INVALID_PICKUP_CODE':
          // Generic 401 for all retrieval failures (security)
          return reply.status(401).send({
            code: 'INVALID_PICKUP_CODE',
            message: result.message,
          });
        case 'PACKAGE_ALREADY_RETRIEVED':
          // Also return generic error - don't reveal package was already retrieved
          return reply.status(401).send({
            code: 'INVALID_PICKUP_CODE',
            message: 'Invalid pickup code or locker code.',
          });
        case 'LOCKER_NOT_FOUND':
          // Generic error - don't reveal if locker exists
          return reply.status(401).send({
            code: 'INVALID_PICKUP_CODE',
            message: 'Invalid pickup code or locker code.',
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
      packageId: result.package.packageId,
      packageReference: result.package.packageReference,
      lockerCode: result.package.lockerCode,
      storedAt: result.package.storedAt.toISOString(),
      retrievedAt: result.package.retrievedAt.toISOString(),
      storageDuration: result.package.storageDuration,
      storageCharge: result.package.storageCharge,
    };

    const validatedResponse = retrievePackageResponseSchema.parse(response);
    return reply.status(200).send(validatedResponse);
  } catch (error) {
    request.log.error(error, 'Error retrieving package');
    // Generic error for all failures (security)
    return reply.status(401).send({
      code: 'INVALID_PICKUP_CODE',
      message: 'Invalid pickup code or locker code.',
    });
  }
}

// Register routes
export async function packageRoutes(app: FastifyInstance) {
  // POST /api/v1/packages - Store a package
  app.post('/', storePackage);

  // POST /api/v1/packages/retrieval - Retrieve a package
  app.post('/retrieval', retrievePackage);
}
