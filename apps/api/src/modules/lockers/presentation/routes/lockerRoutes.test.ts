// Integration tests for locker API routes
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../../../../server.js';
import { db } from '../../../../infrastructure/database/connection.js';
import { storageAssignments, packages } from '../../../../infrastructure/database/schema.js';
import type { FastifyInstance } from 'fastify';

// Test server instance
let app: FastifyInstance;

describe('Locker Routes Integration Tests', () => {
  beforeAll(async () => {
    app = buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await db.delete(storageAssignments);
    await db.delete(packages);
  });

  describe('GET /api/v1/lockers', () => {
    it('should return all lockers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(10); // From seed data
      
      // Check response structure
      const firstLocker = body[0];
      expect(firstLocker).toHaveProperty('id');
      expect(firstLocker).toHaveProperty('code');
      expect(firstLocker).toHaveProperty('size');
      expect(firstLocker).toHaveProperty('isAvailable');
      expect(firstLocker).toHaveProperty('createdAt');
      expect(firstLocker).toHaveProperty('updatedAt');
    });

    it('should filter by size', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers?size=SMALL',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.every((l: { size: string }) => l.size === 'SMALL')).toBe(true);
    });

    it('should filter by availability', async () => {
      // First occupy one locker
      const [newPackage] = await db.insert(packages).values({
        reference: 'TEST-AVAIL',
        size: 'SMALL',
        status: 'STORED',
      }).returning();

      // Get a locker to occupy
      const allResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers',
      });
      const allLockers = JSON.parse(allResponse.body);
      const targetId = allLockers[0].id;

      await db.insert(storageAssignments).values({
        lockerId: targetId,
        packageId: newPackage.id,
        pickupCodeHash: 'hashed-code',
      });

      // Now query available only
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers?available=true',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.every((l: { isAvailable: boolean }) => l.isAvailable === true)).toBe(true);
      expect(body.find((l: { id: string }) => l.id === targetId)).toBeUndefined();
    });

    it('should return 400 for invalid size filter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers?size=INVALID',
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INVALID_QUERY');
    });
  });

  describe('GET /api/v1/lockers/:id', () => {
    it('should return locker by ID', async () => {
      // First get all lockers to find a valid ID
      const allResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers',
      });
      const allLockers = JSON.parse(allResponse.body);
      const targetId = allLockers[0].id;

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/lockers/${targetId}`,
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.id).toBe(targetId);
      expect(body).toHaveProperty('code');
      expect(body).toHaveProperty('size');
      expect(body).toHaveProperty('isAvailable');
    });

    it('should return 404 for non-existent locker', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers/non-existent-uuid',
      });

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('LOCKER_NOT_FOUND');
    });
  });

  describe('GET /api/v1/lockers/code/:code', () => {
    it('should return locker by code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers/code/L-S-001',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('L-S-001');
    });

    it('should return 404 for non-existent code', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/lockers/code/NON-EXISTENT',
      });

      expect(response.statusCode).toBe(404);
      
      const body = JSON.parse(response.body);
      expect(body.code).toBe('LOCKER_NOT_FOUND');
    });
  });

  describe('Health check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body).toHaveProperty('timestamp');
    });
  });
});
