import { execSync } from 'child_process';

/**
 * Reset database for E2E tests
 * Truncates packages and storage_assignments tables
 */
export function resetDatabase(): void {
  try {
    execSync(
      'docker exec spl-postgres-1 psql -U spl -d smart_package_locker -c "TRUNCATE TABLE storage_assignments, packages RESTART IDENTITY CASCADE;"',
      { stdio: 'pipe' }
    );
  } catch (e) {
    // Silent fail - tables might not exist yet
  }
}
