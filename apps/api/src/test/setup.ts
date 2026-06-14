// Test setup and teardown for integration tests
import { execSync } from 'child_process';
import { migrationClient, queryClient } from '../infrastructure/database/connection.js';

// Test database URL (uses main DB but we'll clean it between tests)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL or DATABASE_URL environment variable is required');
}

// Global setup - runs once before all tests
export async function setup() {
  console.log('Setting up test database...');
  
  // Run migrations to ensure schema is up to date
  try {
    execSync('npx drizzle-kit migrate', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Global teardown - runs once after all tests
export async function teardown() {
  console.log('Tearing down test database...');
  
  // Close database connections
  await queryClient.end();
  await migrationClient.end();
}

// Per-test setup - runs before each test
export async function beforeEach() {
  // Clean up test data before each test
  // Note: In production, you'd use transactions or separate test database
  // For this challenge, we'll clean specific tables
  const tables = ['storage_assignments', 'packages', 'lockers'];
  
  for (const table of tables) {
    try {
      await queryClient`TRUNCATE TABLE ${queryClient(table)} CASCADE`;
    } catch (error) {
      // Table might not exist, that's okay
      console.log(`Note: Could not truncate ${table}`);
    }
  }
  
  // Seed fresh test data
  await seedTestData();
}

// Seed minimal test data for each test
async function seedTestData() {
  // Use the shared seed function from seed.ts
  try {
    const { seed } = await import('../infrastructure/database/seeds/seed.js');
    await seed();
  } catch (error) {
    console.log('Seeding skipped or failed (may already have data)');
  }
}

// Vitest uses the named exports above automatically
