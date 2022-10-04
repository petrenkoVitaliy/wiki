import { Injectable } from '@nestjs/common';

@Injectable()
export class HeaderFactory {
  private entitySeq = 0;

  basic() {
    const id = ++this.entitySeq;

    return {
      id,
      content: `header_${id}`,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }
}
