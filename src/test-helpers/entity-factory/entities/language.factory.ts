import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';

@Injectable()
export class LanguageFactory {
  private entitySeq = 0;

  basic(options: { code: string }): Language {
    const id = ++this.entitySeq;

    return {
      id: id,
      code: options.code,
    };
  }
}
