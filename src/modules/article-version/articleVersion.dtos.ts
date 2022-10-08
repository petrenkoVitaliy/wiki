import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PatchArticleVersionDto {
  @ApiProperty()
  @IsBoolean()
  enabled?: boolean;
}
