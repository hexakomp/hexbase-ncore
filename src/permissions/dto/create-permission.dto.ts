import { IsString, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreatePermissionDto {
  /**
   * Permission name in `module:action` or `module:resource:action` format.
   * Examples: `product:create`, `crm:contacts:read`
   */
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9_]*(?::[a-z][a-z0-9_]*)+$/, {
    message:
      'name must be in module:action or module:resource:action format (e.g. product:create)',
  })
  name: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
