import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableAccess } from '../entities/table-access.entity';
import { TableAccessGuard } from './table-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([TableAccess])],
  providers: [TableAccessGuard],
  exports: [TableAccessGuard, TypeOrmModule],
})
export class TableAccessModule {}
