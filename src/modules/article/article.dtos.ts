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
  @IsString()
  body: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  header: string;

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
