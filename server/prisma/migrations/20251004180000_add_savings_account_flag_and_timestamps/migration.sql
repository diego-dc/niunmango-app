-- AlterTable Account - Add isSavingsAccount field
ALTER TABLE "Account" ADD COLUMN "isSavingsAccount" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Entry - Add createdAt and updatedAt fields
ALTER TABLE "Entry" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Entry" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
