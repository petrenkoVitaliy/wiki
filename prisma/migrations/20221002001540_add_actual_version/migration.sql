/*
  Warnings:

  - You are about to drop the column `archived` on the `Schema` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `Schema` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[actualVersionCode]` on the table `ArticleLanguage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actualVersionCode` to the `ArticleLanguage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArticleLanguage" ADD COLUMN     "actualVersionCode" TEXT NOT NULL,
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ArticleVersion" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Schema" DROP COLUMN "archived",
DROP COLUMN "enabled";

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLanguage_actualVersionCode_key" ON "ArticleLanguage"("actualVersionCode");

-- AddForeignKey
ALTER TABLE "ArticleLanguage" ADD CONSTRAINT "ArticleLanguage_actualVersionCode_fkey" FOREIGN KEY ("actualVersionCode") REFERENCES "ArticleVersion"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
