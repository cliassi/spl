// Vitest configuration for integration tests
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'integration',
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.unit.test.ts', 'node_modules'],
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000, // 30 seconds for DB operations
    hookTimeout: 30000,
    teardownTimeout: 30000,
    maxConcurrency: 1, // Run tests sequentially to avoid DB conflicts
  },
});
