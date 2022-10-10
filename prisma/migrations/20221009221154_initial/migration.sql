-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('common', 'special');

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "code" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "type" "ArticleType" NOT NULL DEFAULT 'common',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ArticleLanguage" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameCode" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "languageId" INTEGER NOT NULL,
    "articleCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleLanguage_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ArticleVersion" (
    "code" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "actual" BOOLEAN DEFAULT true,
    "articleLanguageCode" TEXT NOT NULL,
    "schemaCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleVersion_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Schema" (
    "code" TEXT NOT NULL,
    "parentCode" TEXT,
    "bodyId" INTEGER,
    "headerId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Body" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Body_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Header" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Header_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "parentId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "articleCode" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "ArticleCategory_pkey" PRIMARY KEY ("articleCode","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLanguage_name_key" ON "ArticleLanguage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLanguage_nameCode_key" ON "ArticleLanguage"("nameCode");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleLanguage_languageId_articleCode_key" ON "ArticleLanguage"("languageId", "articleCode");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVersion_schemaCode_key" ON "ArticleVersion"("schemaCode");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVersion_version_articleLanguageCode_key" ON "ArticleVersion"("version", "articleLanguageCode");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVersion_actual_articleLanguageCode_key" ON "ArticleVersion"("actual", "articleLanguageCode");

-- AddForeignKey
ALTER TABLE "ArticleLanguage" ADD CONSTRAINT "ArticleLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleLanguage" ADD CONSTRAINT "ArticleLanguage_articleCode_fkey" FOREIGN KEY ("articleCode") REFERENCES "Article"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_articleLanguageCode_fkey" FOREIGN KEY ("articleLanguageCode") REFERENCES "ArticleLanguage"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVersion" ADD CONSTRAINT "ArticleVersion_schemaCode_fkey" FOREIGN KEY ("schemaCode") REFERENCES "Schema"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "Schema"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_bodyId_fkey" FOREIGN KEY ("bodyId") REFERENCES "Body"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "Header"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_articleCode_fkey" FOREIGN KEY ("articleCode") REFERENCES "Article"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCategory" ADD CONSTRAINT "ArticleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
