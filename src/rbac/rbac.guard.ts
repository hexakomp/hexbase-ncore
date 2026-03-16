import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { ROLES_KEY } from '../constants';
import { JwtPayload } from '../interfaces';

/**
 * Guard that validates the authenticated user's role permissions.
 * Runs after JwtAuthGuard and before TableAccessGuard.
 *
 * Requires @Roles('module:action') decorator on the route.
 */
@Injectable()
export class RBACGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user?.roleId) {
      throw new ForbiddenException(
        'Access denied: no role assigned to user. ' +
          'Ensure the user has a role_id set in the database, then log in again to get a fresh token.',
      );
    }

    const role = await this.roleRepository.findOne({
      where: { id: user.roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new ForbiddenException('Access denied: assigned role not found');
    }

    const userPermissions = new Set(role.permissions.map((p) => p.name));

    const hasAll = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Access denied: missing permission(s): ${requiredPermissions
          .filter((p) => !userPermissions.has(p))
          .join(', ')}`,
      );
    }

    return true;
  }
}
