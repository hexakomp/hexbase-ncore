import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTableAccessDto {
  @IsBoolean()
  @IsOptional()
  can_create?: boolean;

  @IsBoolean()
  @IsOptional()
  can_read?: boolean;

  @IsBoolean()
  @IsOptional()
  can_update?: boolean;

  @IsBoolean()
  @IsOptional()
  can_delete?: boolean;
}
