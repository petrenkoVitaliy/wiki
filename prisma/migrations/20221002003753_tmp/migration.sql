/*
  Warnings:

  - You are about to drop the column `actualVersionCode` on the `ArticleLanguage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[actual,articleLanguageCode]` on the table `ArticleVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ArticleLanguage" DROP CONSTRAINT "ArticleLanguage_actualVersionCode_fkey";

-- DropIndex
DROP INDEX "ArticleLanguage_actualVersionCode_key";

-- AlterTable
ALTER TABLE "ArticleLanguage" DROP COLUMN "actualVersionCode";

-- AlterTable
ALTER TABLE "ArticleVersion" ADD COLUMN     "actual" BOOLEAN DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVersion_actual_articleLanguageCode_key" ON "ArticleVersion"("actual", "articleLanguageCode");
