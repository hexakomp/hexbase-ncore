import { SetMetadata } from '@nestjs/common';
import { TABLE_ACCESS_KEY } from '../../constants';

/**
 * Declares which database table the route operates on.
 * TableAccessGuard maps the HTTP method to the appropriate CRUD permission.
 *
 * @example
 * ```typescript
 * @TableAccess('products')
 * @Post()
 * create() {}
 * ```
 */
export const TableAccess = (
  tableName: string,
): MethodDecorator & ClassDecorator => SetMetadata(TABLE_ACCESS_KEY, tableName);
