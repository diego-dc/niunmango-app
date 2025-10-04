-- AlterEnum
-- Update AccountType enum to new values
BEGIN;

-- Create new enum with updated values
CREATE TYPE "AccountType_new" AS ENUM ('CHECKING', 'CUENTA_RUT', 'CUENTA_VISTA', 'BILLETERA_DIGITAL', 'SAVINGS', 'INVESTMENT', 'CASH');

-- Update existing accounts to map to new types
-- CREDIT_CARD -> CHECKING (default mapping)
-- OTHER -> CASH (default mapping)
ALTER TABLE "Account" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Account" ALTER COLUMN "type" TYPE "AccountType_new"
  USING (
    CASE "type"::text
      WHEN 'CREDIT_CARD' THEN 'CHECKING'
      WHEN 'OTHER' THEN 'CASH'
      ELSE "type"::text
    END::"AccountType_new"
  );

-- Drop old enum and rename new one
DROP TYPE "AccountType";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";

-- Restore default
ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT 'CHECKING';

COMMIT;
