import { Article, PrismaClient } from '@prisma/client';
import { convertNameToCode } from '../src/utils/utils';
import { Creators } from './seed/creators';
const prisma = new PrismaClient();

const creators = new Creators(prisma);

// async function createCategoriesStructure(article1: Article, article2: Article) {
//   const [aCategory, bCategory] = await creators.createCategories([
//     {
//       name: 'a',
//       description: 'a',
//     },
//     {
//       name: 'b',
//       description: 'b',
//     },
//   ]);

//   const [bbCategory, aaCategory] = await creators.createCategories([
//     {
//       name: 'bb',
//       description: 'bb',
//       parentId: bCategory.id,
//     },
//     {
//       name: 'aa',
//       description: 'aa',
//       parentId: aCategory.id,
//     },
//     {
//       name: 'ab',
//       description: 'ab',
//       parentId: aCategory.id,
//     },
//   ]);

//   const [, aabCategory] = await creators.createCategories([
//     {
//       name: 'aaa',
//       description: 'aaa',
//       parentId: aaCategory.id,
//     },
//     {
//       name: 'aab',
//       description: 'aab',
//       parentId: aaCategory.id,
//     },
//   ]);

//   await creators.createArticleCategories([
//     { articleCode: article1.code, categoryId: aabCategory.id },
//   ]);

//   await creators.createArticleCategories([
//     { articleCode: article2.code, categoryId: bbCategory.id },
//   ]);
// }

async function main() {
  const [EN, UA] = await creators.createLanguages([
    { code: 'EN' },
    { code: 'UA' },
  ]);

  // const [article1, article2] = await creators.createArticles([{}, {}]);

  // const [articleEn, articleUa] = await creators.createArticleLanguages([
  //   {
  //     languageId: EN.id,
  //     name: 'En name art 1',
  //     nameCode: convertNameToCode('En name art 1'),
  //     articleCode: article1.code,
  //   },
  //   {
  //     languageId: UA.id,
  //     name: 'Ua name art 1',
  //     nameCode: convertNameToCode('Ua name art 1'),
  //     articleCode: article1.code,
  //   },
  //   {
  //     languageId: UA.id,
  //     name: 'Ua name art 2',
  //     nameCode: convertNameToCode('Ua name art 2'),
  //     articleCode: article2.code,
  //   },
  // ]);

  // const [body1] = await creators.createBody([{ content: 'Body 1' }]);

  // const [schemaSelectedEN] = await creators.createSchema([
  //   {
  //     bodyId: body1.id,
  //     parentCode: null,
  //   },
  // ]);

  // await creators.createArticleVersions([
  //   {
  //     articleLanguageCode: articleEn.code,
  //     schemaCode: schemaSelectedEN.code,
  //   },
  // ]);

  // const [schemaSelectedUA1] = await creators.createSchema([
  //   {
  //     bodyId: body1.id,
  //     parentCode: null,
  //   },
  // ]);

  // await creators.createArticleVersions([
  //   {
  //     articleLanguageCode: articleUa.code,
  //     schemaCode: schemaSelectedUA1.code,
  //   },
  // ]);

  // await creators.createSchema([
  //   {
  //     bodyId: body1.id,
  //     parentCode: schemaSelectedUA1.code,
  //   },
  // ]);

  // const [schemaSelectedUA2] = await creators.createSchema([
  //   {
  //     bodyId: body1.id,
  //     parentCode: schemaSelectedUA1.code,
  //   },
  // ]);

  // await creators.createArticleVersions([
  //   {
  //     articleLanguageCode: articleUa.code,
  //     schemaCode: schemaSelectedUA2.code,
  //   },
  // ]);

  // await createCategoriesStructure(article1, article2);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
