// Fastify route handlers for locker endpoints
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LockerRepositoryPostgres } from '../../infrastructure/repositories/LockerRepositoryPostgres.js';
import { Size } from '../../domain/valueObjects/Size.js';
import {
  listLockersQuerySchema,
  listLockersResponseSchema,
  errorResponseSchema,
} from '../schemas/lockerSchemas.js';

// Repository instance (would typically be injected via DI in production)
const lockerRepository = new LockerRepositoryPostgres();

// GET /api/v1/lockers - List all lockers with optional filters
async function listLockers(
  request: FastifyRequest<{ Querystring: { size?: string; available?: string } }>,
  reply: FastifyReply
) {
  try {
    // Validate query parameters
    const queryResult = listLockersQuerySchema.safeParse(request.query);
    if (!queryResult.success) {
      return reply.status(400).send({
        code: 'INVALID_QUERY',
        message: 'Invalid query parameters',
        details: queryResult.error.errors.map((e) => e.message),
      });
    }

    const { size, available } = queryResult.data;

    // Fetch lockers from repository
    let lockers;
    if (size || available !== undefined) {
      // Use findAvailableLockers with filters
      const options: {
        lockerSize?: Size;
        availableOnly?: boolean;
      } = {};

      if (size) {
        options.lockerSize = Size.fromString(size);
      }

      if (available !== undefined) {
        options.availableOnly = available;
      }

      lockers = await lockerRepository.findAvailableLockers(options);
    } else {
      // No filters, return all lockers
      lockers = await lockerRepository.findAll();
    }

    // Map to response DTOs with availability status
    const response = await Promise.all(
      lockers.map(async (locker) => {
        const isAvailable = await lockerRepository.isAvailable(locker.id);
        return {
          id: locker.id,
          code: locker.code,
          size: locker.size.toString(),
          isAvailable,
          createdAt: locker.createdAt.toISOString(),
          updatedAt: locker.updatedAt.toISOString(),
        };
      })
    );

    // Validate response shape
    const validatedResponse = listLockersResponseSchema.parse(response);

    return reply.status(200).send(validatedResponse);
  } catch (error) {
    request.log.error(error, 'Error listing lockers');
    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Failed to list lockers',
    });
  }
}

// GET /api/v1/lockers/:id - Get single locker by ID
async function getLocker(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const locker = await lockerRepository.findById(id);

    if (!locker) {
      return reply.status(404).send({
        code: 'LOCKER_NOT_FOUND',
        message: `Locker with id ${id} not found`,
      });
    }

    const isAvailable = await lockerRepository.isAvailable(locker.id);

    const response = {
      id: locker.id,
      code: locker.code,
      size: locker.size.toString(),
      isAvailable,
      createdAt: locker.createdAt.toISOString(),
      updatedAt: locker.updatedAt.toISOString(),
    };

    return reply.status(200).send(response);
  } catch (error) {
    request.log.error(error, 'Error getting locker');
    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Failed to get locker',
    });
  }
}

// GET /api/v1/lockers/code/:code - Get locker by code
async function getLockerByCode(
  request: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply
) {
  try {
    const { code } = request.params;

    const locker = await lockerRepository.findByCode(code);

    if (!locker) {
      return reply.status(404).send({
        code: 'LOCKER_NOT_FOUND',
        message: `Locker with code ${code} not found`,
      });
    }

    const isAvailable = await lockerRepository.isAvailable(locker.id);

    const response = {
      id: locker.id,
      code: locker.code,
      size: locker.size.toString(),
      isAvailable,
      createdAt: locker.createdAt.toISOString(),
      updatedAt: locker.updatedAt.toISOString(),
    };

    return reply.status(200).send(response);
  } catch (error) {
    request.log.error(error, 'Error getting locker by code');
    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'Failed to get locker',
    });
  }
}

// Register routes
export async function lockerRoutes(app: FastifyInstance) {
  // GET /api/v1/lockers
  app.get('/', listLockers);

  // GET /api/v1/lockers/:id
  app.get('/:id', getLocker);

  // GET /api/v1/lockers/code/:code
  app.get('/code/:code', getLockerByCode);
}
