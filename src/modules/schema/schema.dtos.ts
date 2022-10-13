import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class SectionDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateSchemaDto {
  @IsNotEmpty()
  @IsArray()
  sections: SectionDto[];
}
