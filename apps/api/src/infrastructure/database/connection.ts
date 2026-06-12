import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 
  'postgres://spl:spl_password@localhost:5432/smart_package_locker';

// Create postgres client
// For migrations, we need a separate client with prepared statements disabled
export const migrationClient = postgres(connectionString, { 
  max: 1,
  prepare: false, // Disable prepared statements for migrations
});

// Create main postgres client for queries
export const queryClient = postgres(connectionString, {
  max: 10, // Connection pool size
});

// Create Drizzle ORM instance
export const db = drizzle(queryClient, { schema });

// Export schema for use in other modules
export { schema };

// Graceful shutdown helper
export async function closeDatabase(): Promise<void> {
  await queryClient.end();
  await migrationClient.end();
}
