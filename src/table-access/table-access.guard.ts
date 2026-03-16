import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableAccess } from '../entities/table-access.entity';
import { TABLE_ACCESS_KEY, HttpMethod } from '../constants';
import { JwtPayload } from '../interfaces';

/**
 * Guard that validates row-level CRUD access on a given table for a role.
 * Runs last in the guard chain: JwtAuthGuard -> RBACGuard -> TableAccessGuard.
 *
 * HTTP method is mapped to CRUD flags:
 *   GET    → can_read
 *   POST   → can_create
 *   PUT/PATCH → can_update
 *   DELETE → can_delete
 */
@Injectable()
export class TableAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(TableAccess)
    private readonly tableAccessRepository: Repository<TableAccess>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tableName = this.reflector.getAllAndOverride<string | undefined>(
      TABLE_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!tableName) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: JwtPayload; method: string }>();
    const user = request.user;

    if (!user?.roleId) {
      throw new ForbiddenException('Access denied: no role assigned to user');
    }

    const tableAccess = await this.tableAccessRepository.findOne({
      where: { role_id: user.roleId, table_name: tableName },
    });

    if (!tableAccess) {
      throw new ForbiddenException(
        `Access denied: no table access record for table "${tableName}" and the current role`,
      );
    }

    const allowed = this.resolveAccess(request.method, tableAccess);

    if (!allowed) {
      throw new ForbiddenException(
        `Access denied: role does not have "${request.method}" access on table "${tableName}"`,
      );
    }

    return true;
  }

  private resolveAccess(method: string, tableAccess: TableAccess): boolean {
    switch (method.toUpperCase() as HttpMethod) {
      case HttpMethod.GET:
        return tableAccess.can_read;
      case HttpMethod.POST:
        return tableAccess.can_create;
      case HttpMethod.PUT:
      case HttpMethod.PATCH:
        return tableAccess.can_update;
      case HttpMethod.DELETE:
        return tableAccess.can_delete;
      default:
        return false;
    }
  }
}
