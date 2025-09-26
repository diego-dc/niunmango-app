-- AlterEnum
ALTER TYPE "public"."EntryType" ADD VALUE 'TRANSFER';

-- DropForeignKey
ALTER TABLE "public"."Entry" DROP CONSTRAINT "Entry_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Entry" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Entry" ADD CONSTRAINT "Entry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
