import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RBACGuard } from './rbac.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RBACGuard],
  exports: [RBACGuard, TypeOrmModule],
})
export class RBACModule {}
