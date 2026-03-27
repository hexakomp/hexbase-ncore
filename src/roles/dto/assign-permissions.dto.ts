import { IsArray, ArrayNotEmpty, IsInt, IsPositive } from 'class-validator';

export class AssignPermissionsDto {
  /**
   * Array of permission IDs to assign to the role.
   */
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  permissionIds: number[];
}
