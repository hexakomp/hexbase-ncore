import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexbaseNCoreOptions } from '../interfaces';
import { User, Role, Permission, TableAccess } from '../entities';

@Module({})
export class DatabaseModule {
  static forRoot(options: HexbaseNCoreOptions): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: options.databaseUrl,
          entities: [User, Role, Permission, TableAccess],
          /**
           * Set to true only in development.
           * In production, run migrations explicitly.
           */
          synchronize: false,
          logging: false,
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
