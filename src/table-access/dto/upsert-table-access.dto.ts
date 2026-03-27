import {
  IsInt,
  IsPositive,
  IsString,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpsertTableAccessDto {
  @IsInt()
  @IsPositive()
  role_id: number;

  @IsString()
  @MaxLength(100)
  table_name: string;

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
