import { Module } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';

import { ArticleVersionRepository } from '../../repositories/articleVersion.repository';
import { SchemaRepository } from '../../repositories/schema.repository';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';

@Module({
  controllers: [SchemaController],
  providers: [SchemaService, PrismaService, ArticleVersionRepository, SchemaRepository],
})
export class SchemaModule {}
