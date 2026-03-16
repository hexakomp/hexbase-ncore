import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../../constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsOptional()
  role_id?: number;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
