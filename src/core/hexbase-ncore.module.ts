import { DynamicModule, Module } from '@nestjs/common';
import { HexbaseNCoreOptions } from '../interfaces';
import { HEXBASE_NCORE_OPTIONS } from '../constants';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RBACModule } from '../rbac/rbac.module';
import { TableAccessModule } from '../table-access/table-access.module';

/**
 * Root module for the @hexakomp/hexbase-ncore package.
 *
 * Import once at the application root level using `forRoot`.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     HexbaseNCoreModule.forRoot({
 *       databaseUrl: process.env.DATABASE_URL,
 *       jwtSecret: process.env.JWT_SECRET,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class HexbaseNCoreModule {
  static forRoot(options: HexbaseNCoreOptions): DynamicModule {
    return {
      module: HexbaseNCoreModule,
      global: true,
      imports: [
        DatabaseModule.forRoot(options),
        AuthModule.forRoot(options),
        UsersModule,
        RBACModule,
        TableAccessModule,
      ],
      providers: [
        {
          provide: HEXBASE_NCORE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [
        HEXBASE_NCORE_OPTIONS,
        DatabaseModule,
        AuthModule,
        UsersModule,
        RBACModule,
        TableAccessModule,
      ],
    };
  }
}
