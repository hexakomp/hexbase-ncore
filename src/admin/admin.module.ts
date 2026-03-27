import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { TableAccessModule } from '../table-access/table-access.module';

/**
 * Optional admin management module.
 *
 * Provides REST endpoints for managing Roles, Permissions, and TableAccess.
 * All endpoints require the `admin:manage` permission.
 *
 * Import this module explicitly in your app — it is NOT included automatically
 * by HexbaseNCoreModule.forRoot().
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     HexbaseNCoreModule.forRoot({ ... }),
 *     AdminModule,
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * Exposed endpoints:
 *   GET    /admin/permissions
 *   GET    /admin/permissions/:id
 *   POST   /admin/permissions
 *   POST   /admin/permissions/bulk
 *   DELETE /admin/permissions/:id
 *
 *   GET    /admin/roles
 *   GET    /admin/roles/:id
 *   POST   /admin/roles
 *   PATCH  /admin/roles/:id
 *   DELETE /admin/roles/:id
 *   POST   /admin/roles/:id/permissions        (additive assign)
 *   PUT    /admin/roles/:id/permissions        (replace all)
 *   DELETE /admin/roles/:id/permissions/:permId
 *
 *   GET    /admin/table-access
 *   GET    /admin/table-access?roleId=<id>
 *   GET    /admin/table-access/:id
 *   POST   /admin/table-access                 (upsert by role+table)
 *   PATCH  /admin/table-access/:id
 *   DELETE /admin/table-access/:id
 */
@Module({
  imports: [PermissionsModule, RolesModule, TableAccessModule],
  exports: [PermissionsModule, RolesModule, TableAccessModule],
})
export class AdminModule {}
