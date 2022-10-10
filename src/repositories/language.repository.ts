import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ErrorGenerator } from '../utils/error.generator';

@Injectable()
export class LanguageRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(options: { languageCode: string }) {
    try {
      const result = await this.prisma.language.findFirstOrThrow({
        where: {
          code: options.languageCode,
        },
      });

      return result;
    } catch (ex) {
      throw ErrorGenerator.notFound({ entityName: 'Language' });
    }
  }
}
