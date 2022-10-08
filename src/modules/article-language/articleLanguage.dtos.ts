import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class PatchArticleLanguageDto {
  @ApiProperty()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty()
  @IsString()
  name?: string;
}
