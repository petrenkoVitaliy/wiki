import { Injectable } from '@nestjs/common';

@Injectable()
export class BodyFactory {
  private entitySeq = 0;

  basic() {
    const id = ++this.entitySeq;

    return {
      id,

      content: `body_${id}`,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }
}
