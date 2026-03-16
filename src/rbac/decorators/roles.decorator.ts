import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../constants';

/**
 * Declares which permissions are required to access a route.
 *
 * Permissions use the `module:action` format.
 *
 * @example
 * ```typescript
 * @Roles('product:create', 'product:update')
 * @Get()
 * findAll() {}
 * ```
 */
export const Roles = (
  ...roles: string[]
): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);
