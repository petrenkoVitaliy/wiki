import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

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
      throw new HttpException("Language isn't exist", HttpStatus.NOT_FOUND);
    }
  }
}
