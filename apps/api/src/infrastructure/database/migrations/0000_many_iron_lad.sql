CREATE TABLE IF NOT EXISTS "lockers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"size" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lockers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(50) NOT NULL,
	"size" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'CREATED' NOT NULL,
	"stored_at" timestamp with time zone,
	"retrieved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packages_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storage_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locker_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"pickup_code_hash" varchar(255) NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"retrieved_at" timestamp with time zone,
	"storage_charge_minor_units" text,
	"currency" varchar(3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_locker_package" UNIQUE("locker_id","package_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lockers_code_idx" ON "lockers" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "packages_reference_idx" ON "packages" ("reference");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "packages_status_idx" ON "packages" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignments_locker_idx" ON "storage_assignments" ("locker_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignments_package_idx" ON "storage_assignments" ("package_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage_assignments" ADD CONSTRAINT "storage_assignments_locker_id_lockers_id_fk" FOREIGN KEY ("locker_id") REFERENCES "lockers"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage_assignments" ADD CONSTRAINT "storage_assignments_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
