import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
