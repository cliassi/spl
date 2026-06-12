import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { lockers } from '../schema.js';

const connectionString = process.env.DATABASE_URL || 
  'postgres://spl:spl_password@localhost:5432/smart_package_locker';

async function seed() {
  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log('Seeding lockers...');

  // Seed lockers with deterministic codes
  // Format: L-{SIZE}-{NUMBER}
  // SMALL: L-S-001 to L-S-004 (4 lockers)
  // MEDIUM: L-M-001 to L-M-003 (3 lockers)
  // LARGE: L-L-001 to L-L-003 (3 lockers)

  const lockerData = [
    // Small lockers
    { code: 'L-S-001', size: 'SMALL' },
    { code: 'L-S-002', size: 'SMALL' },
    { code: 'L-S-003', size: 'SMALL' },
    { code: 'L-S-004', size: 'SMALL' },
    // Medium lockers
    { code: 'L-M-001', size: 'MEDIUM' },
    { code: 'L-M-002', size: 'MEDIUM' },
    { code: 'L-M-003', size: 'MEDIUM' },
    // Large lockers
    { code: 'L-L-001', size: 'LARGE' },
    { code: 'L-L-002', size: 'LARGE' },
    { code: 'L-L-003', size: 'LARGE' },
  ];

  try {
    // Insert lockers (will fail if they already exist due to unique constraint)
    await db.insert(lockers).values(lockerData).onConflictDoNothing();
    console.log(`Seeded ${lockerData.length} lockers`);
  } catch (error) {
    console.error('Error seeding lockers:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
