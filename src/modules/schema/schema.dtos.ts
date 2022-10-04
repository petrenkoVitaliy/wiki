import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSchemaDto {
  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  header: string;
}
