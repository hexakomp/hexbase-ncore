import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../../constants';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsNumber()
  @IsOptional()
  role_id?: number;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
