import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateSchemaDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  section: string[];
}
