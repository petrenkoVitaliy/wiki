import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from '../services/prisma.service';

@Injectable()
export class LanguageRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(options: { languageCode: string }) {
    try {
      return this.prisma.language.findFirstOrThrow({
        where: {
          code: options.languageCode,
        },
      });
    } catch (ex) {
      throw new HttpException("Language isn't exist", HttpStatus.NOT_FOUND);
    }
  }
}
