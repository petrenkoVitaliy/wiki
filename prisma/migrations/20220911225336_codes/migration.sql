/*
  Warnings:

  - The primary key for the `Article` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Article` table. All the data in the column will be lost.
  - The primary key for the `ArticleCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `articleId` on the `ArticleCategory` table. All the data in the column will be lost.
  - The primary key for the `ArticleLanguage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `articleId` on the `ArticleLanguage` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ArticleLanguage` table. All the data in the column will be lost.
  - The primary key for the `ArticleVersion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `articleLanguageId` on the `ArticleVersion` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ArticleVersion` table. All the data in the column will be lost.
  - You are about to drop the column `schemaId` on the `ArticleVersion` table. All the data in the column will be lost.
  - The primary key for the `Schema` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Schema` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[languageId,articleCode]` on the table `ArticleLanguage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schemaCode]` on the table `ArticleVersion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[version,articleLanguageCode]` on the table `ArticleVersion` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `Article` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `articleCode` to the `ArticleCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `articleCode` to the `ArticleLanguage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `articleLanguageCode` to the `ArticleVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schemaCode` to the `ArticleVersion` table without a default value. This is not possible if the table is not empty.
  - The required column `code` was added to the `Schema` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "ArticleCategory" DROP CONSTRAINT "ArticleCategory_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleLanguage" DROP CONSTRAINT "ArticleLanguage_articleId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleVersion" DROP CONSTRAINT "ArticleVersion_articleLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "ArticleVersion" DROP CONSTRAINT "ArticleVersion_schemaId_fkey";

-- DropIndex
DROP INDEX "ArticleLanguage_languageId_articleId_key";

-- DropIndex
DROP INDEX "ArticleVersion_schemaId_key";

-- DropIndex
DROP INDEX "ArticleVersion_version_articleLanguageId_key";

-- AlterTable
ALTER TABLE "Article" DROP CONSTRAINT "Article_pkey",
DROP COLUMN "id",
ADD COLUMN     "code" TEXT NOT NULL,
ADD CONSTRAINT "Article_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "ArticleCategory" DROP CONSTRAINT "ArticleCategory_pkey",
DROP COLUMN "articleId",
ADD COLUMN     "articleCode" TEXT NOT NULL,
ADD CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("articleCode", "categoryId");

-- AlterTable
ALTER TABLE "ArticleLanguage" DROP CONSTRAINT "ArticleLanguage_pkey",
DROP COLUMN "articleId",
DROP COLUMN "id",
ADD COLUMN     "articleCode" TEXT NOT NULL,
ADD CONSTRAINT "ArticleLanguage_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "ArticleVersion" DROP CONSTRAINT "ArticleVersion_pkey",
DROP COLUMN "articleLanguageId",
DROP COLUMN "id",
DROP COLUMN "schemaId",
ADD COLUMN     "articleLanguageCode" TEXT NOT NULL,
ADD COLUMN     "schemaCode" TEXT NOT NULL,
ADD CONSTRAINT "ArticleVersion_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "Schema" DROP CONSTRAINT "Schema_pkey",
DROP COLUMN "id",
ADD COLUMN     "code" TEXT NOT NULL,
ADD CONSTRAINT "Schema_pkey" PRIMARY KEY ("code");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLanguage_languageId_articleCode_key" ON "ArticleLanguage"("languageId", "articleCode");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVersion_schemaCode_key" ON "ArticleVersion"("schemaCode");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVersion_version_articleLanguageCode_key" ON "ArticleVersion"("version", "articleLanguageCode");

-- AddForeignKey
ALTER TABLE "ArticleLanguage" ADD CONSTRAINT "ArticleLanguage_articleCode_fkey" FOREIGN KEY ("articleCode") REFERENCES "Article"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_articleLanguageCode_fkey" FOREIGN KEY ("articleLanguageCode") REFERENCES "ArticleLanguage"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_schemaCode_fkey" FOREIGN KEY ("schemaCode") REFERENCES "Schema"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_articleCode_fkey" FOREIGN KEY ("articleCode") REFERENCES "Article"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
