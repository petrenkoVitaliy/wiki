import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaService } from '../../services/prisma.service';
import { CategoryRepository } from '../../repositories/category.repository';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService, CategoryRepository],
})
export class CategoryModule {}
