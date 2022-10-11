import { ApiProperty } from '@nestjs/swagger';
import { ArticleType } from '@prisma/client';
import { IsString, IsNotEmpty, IsNumber, IsArray, IsBoolean, IsEnum } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  section: string[];

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
