-- Migration: Add database-level concurrency protection for locker allocation
-- This ensures that even with concurrent requests, a locker can only be assigned to one package

--> statement-breakpoint
-- Partial unique index: Only one ACTIVE assignment per locker
-- This prevents race conditions where two concurrent requests could assign the same locker
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_locker_assignment" 
ON "storage_assignments" ("locker_id") 
WHERE "retrieved_at" IS NULL;

--> statement-breakpoint
-- Add comment explaining the constraint
COMMENT ON INDEX "unique_active_locker_assignment" IS 
'Prevents concurrent requests from assigning the same locker to multiple packages. Only one active (non-retrieved) assignment allowed per locker.';
