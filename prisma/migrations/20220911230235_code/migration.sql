/*
  Warnings:

  - You are about to drop the column `parentId` on the `Schema` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schema" DROP COLUMN "parentId",
ADD COLUMN     "parentCode" TEXT;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "Schema"("code") ON DELETE SET NULL ON UPDATE CASCADE;
