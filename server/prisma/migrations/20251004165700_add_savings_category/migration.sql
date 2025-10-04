-- AlterEnum
-- Remove SAVINGS from EntryType enum
BEGIN;
CREATE TYPE "EntryType_new" AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER');
ALTER TABLE "Entry" ALTER COLUMN "type" TYPE "EntryType_new" USING ("type"::text::"EntryType_new");
DROP TYPE "EntryType";
ALTER TYPE "EntryType_new" RENAME TO "EntryType";
COMMIT;

-- CreateTable for savings category (will be seeded separately)
-- This migration just prepares the schema, the actual category will be created via seed or application logic
