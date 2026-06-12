// Fastify server setup
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { lockerRoutes } from './modules/lockers/presentation/routes/lockerRoutes.js';
import { packageRoutes } from './modules/packages/presentation/routes/packageRoutes.js';

// Create Fastify instance
export function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
    genReqId: () => crypto.randomUUID(),
  });

  // Security middleware
  app.register(helmet);
  app.register(cors, {
    origin: process.env.CORS_ORIGIN || true, // Allow all in dev, configure for prod
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  // API routes
  app.register(lockerRoutes, { prefix: '/api/v1/lockers' });
  app.register(packageRoutes, { prefix: '/api/v1/packages' });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error, 'Unhandled error');

    if (error.validation) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.message,
      });
    }

    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId: request.id,
    });
  });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return app;
}

// Start server if running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildServer();
  const port = parseInt(process.env.PORT || '3000', 10);

  app.listen({ port, host: '0.0.0.0' }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening on port ${port}`);
  });
}
