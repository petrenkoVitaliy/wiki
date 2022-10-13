import { ApiProperty } from '@nestjs/swagger';
import { ArticleType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { SectionDto } from '../schema/schema.dtos';

export class CreateArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsArray()
  sections: SectionDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  categoriesIds: number[];
}

export class PatchArticleDto {
  @ApiProperty()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty()
  @IsEnum(ArticleType)
  type?: ArticleType;
}
