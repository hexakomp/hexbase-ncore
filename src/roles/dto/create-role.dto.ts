import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
